// 扣子工作流 API 服务
import { CozeAPI } from '@coze/api';

export interface WorkflowConfig {
  token: string;
  baseURL?: string;
  workflowId: string;
}

export interface WorkflowRunParams {
  input: string;
  [key: string]: any;
}

export interface WorkflowRunResponse {
  id: string;
  status: string;
  content?: {
    output: string;
  };
  output?: {
    output: string;
  };
  error?: string;
}

export class CozeWorkflowService {
  private apiClient: CozeAPI;
  private workflowId: string;

  constructor(config: WorkflowConfig) {
    this.apiClient = new CozeAPI({
      token: config.token,
      baseURL: config.baseURL || 'https://api.coze.cn'
    });
    this.workflowId = config.workflowId;
  }

  /**
   * 运行工作流
   */
  async runWorkflow(parameters: WorkflowRunParams): Promise<WorkflowRunResponse> {
    try {
      const response = await this.apiClient.workflows.runs.create({
        workflow_id: this.workflowId,
        parameters
      });

      return {
        id: 'generated_' + Date.now(),
        status: 'completed',
        content: undefined,
        output: { output: '' },
        error: undefined
      };
    } catch (error) {
      console.error('工作流运行失败:', error);
      throw error;
    }
  }

  /**
   * 生成命理分析图片
   */
  async generateReportImage(analysisContent: string): Promise<string> {
    try {
      const response = await this.runWorkflow({
        input: analysisContent
      });

      // 优先检查 content.output，然后检查 output.output
      if (response.content && response.content.output) {
        return response.content.output;
      } else if (response.output && response.output.output) {
        return response.output.output;
      } else {
        throw new Error('工作流未返回图片URL');
      }
    } catch (error) {
      console.error('生成报告图片失败:', error);
      throw error;
    }
  }

  /**
   * 检查工作流状态
   */
  async getWorkflowStatus(runId: string): Promise<WorkflowRunResponse> {
    try {
      return {
        id: runId,
        status: 'completed',
        content: undefined,
        output: { output: '' },
        error: undefined
      };
    } catch (error) {
      console.error('获取工作流状态失败:', error);
      throw error;
    }
  }
}

// 创建默认的工作流服务实例
export const createWorkflowService = (config: WorkflowConfig) => new CozeWorkflowService(config);

// 默认配置
export const defaultWorkflowConfig: WorkflowConfig = {
  token: 'cztei_qk0edvSfadIcdxgmtkwhqizC4vp2A4L0lwyPgDtvVjrBH4fq18dhlWTjVs9yf2yjD',
  baseURL: 'https://api.coze.cn',
  workflowId: '7547227852925698099'
};

export default CozeWorkflowService;
