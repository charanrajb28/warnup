export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // strip  "data:...;base64," prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
  });
}

export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
    case "emergency":
    case "life_threatening":
      return "#ef4444";
    case "high":
    case "severe":
      return "#f97316";
    case "medium":
    case "moderate":
    case "warning":
      return "#f59e0b";
    case "low":
    case "mild":
    case "normal":
      return "#10b981";
    default:
      return "#94a3b8";
  }
}

export function getSeverityBadgeClass(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
    case "emergency":
    case "life_threatening":
      return "badge-critical";
    case "high":
    case "severe":
      return "badge-high";
    case "medium":
    case "moderate":
    case "warning":
      return "badge-warning";
    case "low":
    case "mild":
    case "normal":
      return "badge-normal";
    default:
      return "badge-medium";
  }
}
