export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export type GoalContribution = {
  id: string;
  savingsGoalId: string;
  amount: number;
  contributedAt: string;
  notes?: string | null;
  createdAt: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  description?: string | null;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  status: GoalStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  remainingAmount: number;
  progressPercentage: number;
  contributions: GoalContribution[];
};

export type CreateSavingsGoalInput = {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  notes?: string;
};

export type CreateGoalContributionInput = {
  amount: number;
  contributedAt: string;
  notes?: string;
};
