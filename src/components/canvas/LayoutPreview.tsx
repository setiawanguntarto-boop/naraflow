/**
 * LayoutPreview - Modal showing before/after layout comparison
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutOptions } from "../../core/layout/types";

interface LayoutPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  currentNodes: any[];
  currentEdges: any[];
  layoutOptions: LayoutOptions;
  selectedNodeIds?: string[];
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  isOpen,
  onClose,
  onApply,
  currentNodes,
  currentEdges,
  layoutOptions,
  selectedNodeIds = [],
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[60vh] p-6">
        <DialogHeader>
          <DialogTitle>Layout Preview Test</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Preview Test</h3>
            <p className="text-gray-600 mb-4">
              Current nodes: {currentNodes.length}
              <br />
              Current edges: {currentEdges.length}
              <br />
              Layout engine: {layoutOptions.engine}
              <br />
              Layout direction: {layoutOptions.direction}
            </p>
            <Button onClick={onApply} className="mr-2">
              Apply Layout
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
