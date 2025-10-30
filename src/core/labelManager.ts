import connectionLabelLibraryData from "@/core/connectionLabelLibrary.json";
import { ConnectionLabel, ConnectionLabelCategory } from "@/types/connectionLabel.types";

export class LabelManager {
  private static library = connectionLabelLibraryData;

  static getAllLabels(): ConnectionLabel[] {
    const labels: ConnectionLabel[] = [];
    Object.values(this.library.categories).forEach(category => {
      labels.push(...(category.labels as ConnectionLabel[]));
    });
    return labels;
  }

  static getLabelsByCategory(categoryId: string): ConnectionLabel[] {
    const category = this.library.categories[categoryId as keyof typeof this.library.categories];
    return category ? (category.labels as ConnectionLabel[]) : [];
  }

  static getLabelById(labelId: string): ConnectionLabel | null {
    for (const category of Object.values(this.library.categories)) {
      const label = category.labels.find(l => l.id === labelId);
      if (label) return label as ConnectionLabel;
    }
    return null;
  }

  static searchLabels(query: string): ConnectionLabel[] {
    const allLabels = this.getAllLabels();
    const lowercaseQuery = query.toLowerCase();

    return allLabels.filter(
      label =>
        label.displayName.toLowerCase().includes(lowercaseQuery) ||
        label.description.toLowerCase().includes(lowercaseQuery) ||
        label.id.toLowerCase().includes(lowercaseQuery)
    );
  }

  static getCategories(): ConnectionLabelCategory[] {
    return Object.values(this.library.categories) as ConnectionLabelCategory[];
  }

  static getCategoryById(categoryId: string): ConnectionLabelCategory | null {
    const cat = this.library.categories[categoryId as keyof typeof this.library.categories];
    return cat ? (cat as ConnectionLabelCategory) : null;
  }

  static getLabelsByDirection(direction: "forward" | "backward" | "loop"): ConnectionLabel[] {
    const allLabels = this.getAllLabels();
    return allLabels.filter(label => label.direction === direction);
  }

  static getMostUsedLabels(
    usageCount: Record<string, number>,
    limit: number = 10
  ): ConnectionLabel[] {
    const sortedEntries = Object.entries(usageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    return sortedEntries
      .map(([labelId]) => this.getLabelById(labelId))
      .filter((label): label is ConnectionLabel => label !== null);
  }

  static validateLabelId(labelId: string): boolean {
    return this.getLabelById(labelId) !== null;
  }

  static getLabelColor(labelId: string): string {
    const label = this.getLabelById(labelId);
    return label?.color || "#9CA3AF";
  }

  static getLabelDisplayName(labelId: string): string {
    const label = this.getLabelById(labelId);
    return label?.displayName || labelId;
  }

  static getLabelDescription(labelId: string): string {
    const label = this.getLabelById(labelId);
    return label?.description || "";
  }

  static getCategoryForLabel(labelId: string): string | null {
    const label = this.getLabelById(labelId);
    return label?.category || null;
  }

  static getCategoryColor(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category?.color || "#9CA3AF";
  }

  static getCategoryTitle(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category?.title || categoryId;
  }

  static exportLabels(): string {
    return JSON.stringify(this.library, null, 2);
  }

  static importLabels(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      if (imported.version && imported.categories) {
        this.library = imported;
        return true;
      }
    } catch (error) {
      console.error("Failed to import labels:", error);
    }
    return false;
  }

  static getLibraryVersion(): string {
    return this.library.version || "1.0.0";
  }

  static getLibraryStats(): {
    totalLabels: number;
    totalCategories: number;
    labelsPerCategory: Record<string, number>;
  } {
    const totalLabels = this.getAllLabels().length;
    const totalCategories = Object.keys(this.library.categories).length;
    const labelsPerCategory: Record<string, number> = {};

    Object.entries(this.library.categories).forEach(([categoryId, category]) => {
      labelsPerCategory[categoryId] = category.labels.length;
    });

    return {
      totalLabels,
      totalCategories,
      labelsPerCategory,
    };
  }
}
