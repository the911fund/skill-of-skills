/**
 * Maintenance status levels for tools based on last commit date
 */
export type MaintenanceStatus = 'Active' | 'Maintained' | 'Stale' | 'Inactive' | 'Unknown';

/**
 * Result of maintenance status calculation
 */
export interface MaintenanceStatusResult {
  status: MaintenanceStatus;
  color: string;
}

/**
 * Time thresholds in days for each maintenance status
 */
const THRESHOLDS = {
  ACTIVE: 30,      // Less than 30 days
  MAINTAINED: 90,  // 30-90 days
  STALE: 180,      // 90-180 days
  // More than 180 days = Inactive
};

/**
 * Color codes for each maintenance status
 */
const COLORS = {
  Active: '#22c55e',     // Green
  Maintained: '#eab308', // Yellow
  Stale: '#f97316',      // Orange
  Inactive: '#ef4444',   // Red
  Unknown: '#6b7280',    // Gray
};

/**
 * Calculate maintenance status based on last commit date
 *
 * @param lastCommitDate - The last commit date as Date, string (ISO), or null
 * @returns Object with status and color
 */
export function getMaintenanceStatus(
  lastCommitDate: Date | string | null
): MaintenanceStatusResult {
  // Handle null or undefined
  if (!lastCommitDate) {
    return {
      status: 'Unknown',
      color: COLORS.Unknown,
    };
  }

  // Convert to Date if string
  const commitDate = typeof lastCommitDate === 'string'
    ? new Date(lastCommitDate)
    : lastCommitDate;

  // Check if valid date
  if (isNaN(commitDate.getTime())) {
    return {
      status: 'Unknown',
      color: COLORS.Unknown,
    };
  }

  // Calculate days since last commit
  const now = new Date();
  const daysSinceCommit = Math.floor(
    (now.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine status based on thresholds
  let status: MaintenanceStatus;

  if (daysSinceCommit < THRESHOLDS.ACTIVE) {
    status = 'Active';
  } else if (daysSinceCommit < THRESHOLDS.MAINTAINED) {
    status = 'Maintained';
  } else if (daysSinceCommit < THRESHOLDS.STALE) {
    status = 'Stale';
  } else {
    status = 'Inactive';
  }

  return {
    status,
    color: COLORS[status],
  };
}
