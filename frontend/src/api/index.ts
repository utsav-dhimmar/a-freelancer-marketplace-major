import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import type {
    IAuthResponse,
    IContract,
    IFreelancer,
    IJob,
    IPortfolioItem,
    IProposal,
    IUser,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
	error: AxiosError | null,
	token: string | null = null,
) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const accessToken = localStorage.getItem("accessToken");
	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}
	return config;
});

api.interceptors.response.use(
	response => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then(token => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return api(originalRequest);
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = localStorage.getItem("refreshToken");
			if (!refreshToken) {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				window.location.href = "/login";
				return Promise.reject(error);
			}

			try {
				const response = await axios.post(
					`${API_URL}/users/refresh-token`,
					{
						refreshToken,
					},
				);
				const { accessToken: newAccessToken } = response.data.data;
				localStorage.setItem("accessToken", newAccessToken);
				processQueue(null, newAccessToken);
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as AxiosError, null);
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				window.location.href = "/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

export const authApi = {
	register: async (data: {
		email: string;
		username: string;
		password: string;
		role: string;
	}) => {
		const response = await api.post<{ message: string; user: IUser }>(
			"/users/register",
			data,
		);
		return response.data;
	},

	login: async (data: { email: string; password: string }) => {
		const response = await api.post<IAuthResponse>("/users/login", data);
		if (response.data.accessToken) {
			localStorage.setItem("accessToken", response.data.accessToken);
			localStorage.setItem("refreshToken", response.data.refreshToken);
		}
		return response.data;
	},

	logout: async () => {
		const refreshToken = localStorage.getItem("refreshToken");
		await api.post("/users/logout", { refreshToken });
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
	},

	me: async () => {
		const response = await api.get<IUser>("/users/me");
		return response.data;
	},

	updateProfilePicture: async (formData: FormData) => {
		const response = await api.post<{ profilePicture: string }>(
			"/users/profile-picture",
			formData,
			{
				headers: { "Content-Type": "multipart/form-data" },
			},
		);
		return response.data;
	},
};

export const jobApi = {
	getAll: async (params?: {
		search?: string;
		status?: string;
		skills?: string;
	}) => {
		const response = await api.get<{ jobs: IJob[]; total: number }>(
			"/jobs",
			{
				params,
			},
		);
		return response.data;
	},

	getById: async (id: string) => {
		const response = await api.get<IJob>(`/jobs/${id}`);
		return response.data;
	},

	create: async (data: Partial<IJob>) => {
		const response = await api.post<IJob>("/jobs", data);
		return response.data;
	},

	update: async (id: string, data: Partial<IJob>) => {
		const response = await api.put<IJob>(`/jobs/${id}`, data);
		return response.data;
	},

	delete: async (id: string) => {
		await api.delete(`/jobs/${id}`);
	},

	myJobs: async () => {
		const response = await api.get<IJob[]>("/jobs/my-jobs");
		return response.data;
	},
};

export const freelancerApi = {
	getAll: async (params?: { search?: string; skills?: string }) => {
		const response = await api.get<{
			freelancers: IFreelancer[];
			total: number;
		}>("/freelancers", { params });
		return response.data;
	},

	getById: async (id: string) => {
		const response = await api.get<IFreelancer>(`/freelancers/${id}`);
		return response.data;
	},

	getMe: async () => {
		const response = await api.get<IFreelancer>("/freelancers/me");
		return response.data;
	},

	create: async (data: Partial<IFreelancer>) => {
		const response = await api.post<IFreelancer>("/freelancers", data);
		return response.data;
	},

	update: async (id: string, data: Partial<IFreelancer>) => {
		const response = await api.put<IFreelancer>(`/freelancers/${id}`, data);
		return response.data;
	},

	addPortfolioItem: async (item: IPortfolioItem) => {
		const response = await api.post<IFreelancer>(
			"/freelancers/portfolio",
			item,
		);
		return response.data;
	},

	updatePortfolioItem: async (index: number, item: IPortfolioItem) => {
		const response = await api.put<IFreelancer>(
			`/freelancers/portfolio/${index}`,
			item,
		);
		return response.data;
	},

	deletePortfolioItem: async (index: number) => {
		const response = await api.delete<IFreelancer>(
			`/freelancers/portfolio/${index}`,
		);
		return response.data;
	},
};

export const proposalApi = {
	submit: async (data: {
		jobId: string;
		coverLetter: string;
		proposedAmount: number;
		estimatedDuration: number;
	}) => {
		const response = await api.post<IProposal>("/proposals", data);
		return response.data;
	},

	getByJob: async (jobId: string) => {
		const response = await api.get<IProposal[]>(`/proposals/job/${jobId}`);
		return response.data;
	},

	getMyProposals: async () => {
		const response = await api.get<IProposal[]>("/proposals");
		return response.data;
	},

	update: async (id: string, data: Partial<IProposal>) => {
		const response = await api.put<IProposal>(`/proposals/${id}`, data);
		return response.data;
	},

	withdraw: async (id: string) => {
		const response = await api.post<IProposal>(`/proposals/${id}/withdraw`);
		return response.data;
	},

	accept: async (id: string) => {
		const response = await api.post<IProposal>(`/proposals/${id}/accept`);
		return response.data;
	},

	reject: async (id: string) => {
		const response = await api.post<IProposal>(`/proposals/${id}/reject`);
		return response.data;
	},
};

export const contractApi = {
	create: async (data: { jobId: string; proposalId: string }) => {
		const response = await api.post<IContract>("/contracts", data);
		return response.data;
	},

	getMyContracts: async () => {
		const response = await api.get<IContract[]>("/contracts");
		return response.data;
	},

	getById: async (id: string) => {
		const response = await api.get<IContract>(`/contracts/${id}`);
		return response.data;
	},

	submitWork: async (id: string, workDescription: string) => {
		const response = await api.post<IContract>(
			`/contracts/${id}/submit-work`,
			{
				workDescription,
			},
		);
		return response.data;
	},

	completeContract: async (id: string) => {
		const response = await api.post<IContract>(`/contracts/${id}/complete`);
		return response.data;
	},

	raiseDispute: async (id: string, reason: string) => {
		const response = await api.post<IContract>(`/contracts/${id}/dispute`, {
			reason,
		});
		return response.data;
	},

	cancelContract: async (id: string) => {
		const response = await api.post<IContract>(`/contracts/${id}/cancel`);
		return response.data;
	},
};

export default api;
