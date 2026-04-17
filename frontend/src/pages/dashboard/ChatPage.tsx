import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, contractApi } from '../../api';
import type { IChatMessage } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import type { IContract, IJob } from '../../types';
import { socketService } from '../../services/socket.service';
import type { Socket } from 'socket.io-client';
import { UserProfileCard } from '../../components/ui';

interface SocketAckResponse {
  ok: boolean;
  error?: string;
}

interface NewMessageEvent {
  contractId: string;
  message: IChatMessage;
}

interface MessageReadEvent {
  contractId: string;
  userId: string;
  messageIds: string[];
  readAt: string;
}

export function ChatPage() {
  const { id: contractId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id || '';

  const [contract, setContract] = useState<IContract | null>(null);
  const [job, setJob] = useState<IJob | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (contractId) {
      void loadContractAndMessages();
    }
  }, [contractId]);

  useEffect(() => {
    // For the initial load, we might want instant scroll
    scrollToBottom(messages.length > 0 && !loading);
  }, [messages, loading]);

  useEffect(() => {
    if (
      !contractId ||
      !contract ||
      !['active', 'submitted'].includes(contract.status)
    ) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = socketService.connect(token);
    socketRef.current = socket;

    const handleConnect = () => {
      setIsSocketConnected(true);
      socket.emit(
        'join_contract',
        { contractId },
        (response: SocketAckResponse) => {
          if (!response.ok) {
            console.error('Failed to join socket room:', response.error);
          }
        },
      );
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleNewMessage = (payload: NewMessageEvent) => {
      if (payload.contractId !== contractId) return;
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === payload.message.id)) {
          return prev;
        }
        return [...prev, payload.message];
      });
    };

    const handleMessageRead = (payload: MessageReadEvent) => {
      if (payload.contractId !== contractId) return;
      if (!payload.messageIds.length) return;

      setMessages((prev) =>
        prev.map((msg) => {
          if (!payload.messageIds.includes(msg.id)) {
            return msg;
          }

          const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
          if (readBy.includes(payload.userId)) {
            return msg;
          }

          return {
            ...msg,
            readBy: [...readBy, payload.userId],
          };
        }),
      );
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.emit('leave_contract', { contractId });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socketService.disconnect();
      socketRef.current = null;
      setIsSocketConnected(false);
    };
  }, [contractId, contract]);

  useEffect(() => {
    if (!contractId || !currentUserId || !socketRef.current) return;
    if (!socketRef.current.connected) return;

    const unreadMessageIds = messages
      .filter((msg) => {
        if (msg.senderId === currentUserId) return false;
        const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
        return !readBy.includes(currentUserId);
      })
      .map((msg) => msg.id);

    if (unreadMessageIds.length === 0) return;

    socketRef.current.emit('message_read', {
      contractId,
      messageIds: unreadMessageIds,
    });
  }, [messages, contractId, currentUserId]);

  const scrollToBottom = (smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  const loadContractAndMessages = async () => {
    try {
      if (!contractId) return;

      const contractData = await contractApi.getById(contractId);
      setContract(contractData);
      setJob(contractData.job);

      // Only allow chat on active or submitted contracts
      if (!['active', 'submitted'].includes(contractData.status)) {
        setError('Chat is only available for active or submitted contracts');
        setLoading(false);
        return;
      }

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
      const socket = socketRef.current;
      const outgoingMessage = newMessage.trim();

      if (socket?.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            'send_message',
            { contractId, message: outgoingMessage },
            (response: SocketAckResponse) => {
              if (response.ok) {
                resolve();
                return;
              }
              reject(new Error(response.error || 'Failed to send message'));
            },
          );
        });
      } else {
        const sent = await chatApi.sendMessage(contractId, outgoingMessage);
        setMessages((prev) => [...prev, sent]);
      }
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
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return (
      date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const isMyMessage = (msg: IChatMessage) => msg.senderId === currentUserId;

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
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={`badge ${contract?.status === 'active' ? 'bg-primary' : 'bg-warning'}`}>
                {contract?.status}
              </span>
              <span className={`badge ${isSocketConnected ? 'bg-success' : 'bg-secondary'}`}>
                {isSocketConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {contract && (
          <div className="d-none d-md-block">
            <UserProfileCard 
              user={user?.role === 'client' ? contract.freelancer : contract.client} 
              variant="mini" 
            />
          </div>
        )}
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
          ref={scrollContainerRef}
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
                      {mine &&
                        Array.isArray(msg.readBy) &&
                        msg.readBy.length > 1 && (
                          <span style={{ marginLeft: '0.5rem' }}>Seen</span>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
