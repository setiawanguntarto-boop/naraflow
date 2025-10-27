import { ConnectionLabel } from "@/types/connectionLabel.types";

export interface ConnectionLabelRenderOptions {
  text: string;
  color: string;
  tooltip: string;
  fontStyle: string;
  padding: number;
  cornerRadius: number;
  fontSize?: number;
  fontWeight?: string;
}

export function renderConnectionLabel(label: ConnectionLabel): ConnectionLabelRenderOptions {
  return {
    text: label.displayName,
    color: label.color,
    tooltip: label.description || "",
    fontStyle: "italic",
    padding: 6,
    cornerRadius: 6,
    fontSize: 12,
    fontWeight: "500",
  };
}

export function getConnectionLabelById(labelId: string, library: any): ConnectionLabel | null {
  for (const category of Object.values(library.categories)) {
    const label = (category as any).labels.find((l: ConnectionLabel) => l.id === labelId);
    if (label) return label;
  }
  return null;
}

export function getAllConnectionLabels(library: any): ConnectionLabel[] {
  const allLabels: ConnectionLabel[] = [];
  for (const category of Object.values(library.categories)) {
    allLabels.push(...(category as any).labels);
  }
  return allLabels;
}

export function getLabelsByCategory(categoryId: string, library: any): ConnectionLabel[] {
  const category = library.categories[categoryId];
  return category ? category.labels : [];
}
