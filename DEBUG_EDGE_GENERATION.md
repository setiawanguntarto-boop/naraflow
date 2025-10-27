# Debug: Edge Generation Issue

## Problem
Connector (edges) tidak muncul di canvas meskipun node sudah ter-generate dengan benar.

## Root Cause Analysis

### 1. **Edge ID Collision Issue**
   - **File**: `src/lib/promptInterpreter/workflowAssembler.ts`
   - **Problem**: Edge ID menggunakan format `${plan.nodeId}-${conn.target}` yang bisa collision jika ada multiple edges dengan source/target yang sama
   - **Impact**: Edge dengan ID yang sama akan overwrite satu sama lain saat di-convert ke Record format
   
### 2. **Missing Debug Information**
   - Tidak ada console logs untuk trace edge data flow
   - Sulit untuk diagnose apakah edges dibuat dengan benar

## Solutions Implemented

### 1. Unique Edge ID Generation
**File**: `src/lib/promptInterpreter/workflowAssembler.ts` (line 59-61)

```typescript
// Before:
const edge = {
  id: `${plan.nodeId}-${conn.target}`,
  ...
};

// After:
const uniqueEdgeId = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const edge = {
  id: uniqueEdgeId,
  ...
};
```

**Benefit**: Setiap edge sekarang memiliki unique ID yang tidak akan collision.

### 2. Debug Console Logs Added
**File**: `src/lib/promptInterpreter/workflowAssembler.ts` (line 95-107)

```typescript
console.log('🔗 Edge Generation:', {
  totalNodes: nodes.length,
  totalEdges: edges.length,
  edgeIds: edges.map(e => e.id),
  edges: edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle
  }))
});
```

**File**: `src/components/sections/workflow-studio.tsx` (line 205-225)

```typescript
console.log('📊 Preview Data:', {
  nodeCount: previewData.nodes.length,
  edgeCount: previewData.edges.length,
  edges: previewData.edges,
  nodes: previewData.nodes
});

console.log('📊 Records:', {
  nodeKeys: Object.keys(nodesRecord),
  edgeKeys: Object.keys(edgesRecord),
  edgesRecord
});
```

**Benefit**: Debug information untuk trace edge data dari assembler → canvas.

## Testing Steps

1. **Start Dev Server**:
   ```bash
   npm run dev
   ```

2. **Generate Workflow**:
   - Go to `/workflow-studio`
   - Enter prompt: "buatkan workflow pengajuan cuti..."
   - Click "Generate"

3. **Check Console Logs**:
   - Look for `🔗 Edge Generation:` log (from workflowAssembler)
   - Should show:
     - `totalEdges`: count of edges
     - `edgeIds`: array of unique edge IDs
     - `edges`: array of edge objects with source, target, handles
   
4. **Apply to Canvas**:
   - Click "Apply" in preview modal
   - Look for `📊 Preview Data:` and `📊 Records:` logs
   - Should show:
     - Edge data in preview
     - Edge keys in records
     - EdgesRecord object with unique IDs

5. **Verify Canvas**:
   - Edges should now appear connecting the nodes
   - Check visual connection lines between nodes

## Expected Output

### Console Logs Example:

```
🔗 Edge Generation: {
  totalNodes: 7,
  totalEdges: 7,
  edgeIds: ['edge-1234567890-abc123', 'edge-1234567891-def456', ...],
  edges: [
    {
      id: 'edge-1234567890-abc123',
      source: 'start-123',
      target: 'trigger-456',
      sourceHandle: 'default',
      targetHandle: 'default'
    },
    ...
  ]
}

📊 Preview Data: {
  nodeCount: 7,
  edgeCount: 7,
  edges: [...],
  nodes: [...]
}

📊 Records: {
  nodeKeys: ['start-123', 'trigger-456', ...],
  edgeKeys: ['edge-1234567890-abc123', ...],
  edgesRecord: {...}
}
```

## Next Steps

1. **Remove Debug Logs** (Optional):
   - After verifying fix works, can remove console.log statements for production
   
2. **Edge Type Verification**:
   - Confirm that `type: 'smoothstep'` is supported by WorkflowCanvas
   - Check if CustomEdge component needs updates
   
3. **Edge Rendering**:
   - Verify edges render with correct colors based on connectionLabel
   - Test edge interaction (click, context menu, etc.)

## Files Modified

1. ✅ `src/lib/promptInterpreter/workflowAssembler.ts`
   - Fixed edge ID generation (unique IDs)
   - Added debug logs
   
2. ✅ `src/components/sections/workflow-studio.tsx`
   - Added debug logs in handleApplyToCanvas

## Build Status

✅ Build successful - No TypeScript errors

