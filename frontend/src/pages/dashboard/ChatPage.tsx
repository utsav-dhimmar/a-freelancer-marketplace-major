import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, contractApi, jobApi } from '../../api';
import type { IChatMessage } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import type { IContract, IJob } from '../../types';

export function ChatPage() {
    const { id: contractId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [contract, setContract] = useState<IContract | null>(null);
    const [job, setJob] = useState<IJob | null>(null);
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (contractId) {
            loadContractAndMessages();
            // Poll for new messages every 5 seconds
            pollIntervalRef.current = setInterval(() => {
                loadMessages(false);
            }, 5000);
        }

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [contractId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadContractAndMessages = async () => {
        try {
            if (!contractId) return;

            const contractData = await contractApi.getById(contractId);
            setContract(contractData);

            // Only allow chat on active or submitted contracts
            if (!['active', 'submitted'].includes(contractData.status)) {
                setError('Chat is only available for active or submitted contracts');
                setLoading(false);
                return;
            }

            try {
                const jobData = await jobApi.getById(contractData.jobId);
                setJob(jobData);
            } catch { }

            await loadMessages(true);
        } catch (err) {
            setError('Failed to load contract');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (showLoading: boolean) => {
        try {
            if (!contractId) return;
            if (showLoading) setLoading(true);

            const data = await chatApi.getMessages(contractId, 1, 100);
            // Reverse so oldest messages are at the top
            setMessages([...data.messages].reverse());
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !contractId || sending) return;

        setSending(true);
        try {
            const sent = await chatApi.sendMessage(contractId, newMessage.trim());
            setMessages((prev) => [...prev, sent]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return (
            date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
            ' ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
    };

    const isMyMessage = (msg: IChatMessage) => {
        const userId = user?._id || user?.id;
        return msg.senderId === userId;
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">{error}</div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard/contracts')}
                >
                    ← Back to Contracts
                </button>
            </div>
        );
    }

    return (
        <div className="container py-4" style={{ maxWidth: 800 }}>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-3">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => navigate('/dashboard/contracts')}
                    >
                        ← Back
                    </button>
                    <div>
                        <h5 className="mb-0">{job?.title || 'Contract Chat'}</h5>
                        <small className="text-muted">
                            Contract #{contractId?.slice(-6)} &middot;{' '}
                            <span
                                className={`badge ${contract?.status === 'active' ? 'bg-primary' : 'bg-warning'
                                    }`}
                            >
                                {contract?.status}
                            </span>
                        </small>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div
                className="card"
                style={{
                    height: 'calc(100vh - 250px)',
                    minHeight: 400,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Messages */}
                <div
                    className="card-body"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1rem',
                    }}
                >
                    {messages.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <p className="mb-1">No messages yet</p>
                            <small>Send a message to start the conversation</small>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const mine = isMyMessage(msg);
                            return (
                                <div
                                    key={msg.id}
                                    className={`d-flex mb-3 ${mine ? 'justify-content-end' : 'justify-content-start'}`}
                                >
                                    <div
                                        style={{
                                            maxWidth: '70%',
                                            padding: '0.6rem 1rem',
                                            borderRadius: mine
                                                ? '1rem 1rem 0.25rem 1rem'
                                                : '1rem 1rem 1rem 0.25rem',
                                            backgroundColor: mine ? '#0d6efd' : '#e9ecef',
                                            color: mine ? '#fff' : '#212529',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {!mine && (
                                            <div
                                                style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    marginBottom: '0.2rem',
                                                    color: '#6c757d',
                                                }}
                                            >
                                                {msg.senderName}
                                            </div>
                                        )}
                                        <div>{msg.message}</div>
                                        <div
                                            style={{
                                                fontSize: '0.7rem',
                                                textAlign: 'right',
                                                marginTop: '0.25rem',
                                                opacity: 0.7,
                                            }}
                                        >
                                            {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="card-footer bg-white border-top">
                    <form onSubmit={handleSend} className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!newMessage.trim() || sending}
                        >
                            {sending ? (
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                />
                            ) : (
                                'Send'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
