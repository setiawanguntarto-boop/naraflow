import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

export async function storageSaveExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { storage, logger } = context.services;
  const { payload, vars } = context;

  if (!storage && config.destination !== "local_storage") {
    return {
      status: "error",
      error: { message: "Storage service not available", code: "NO_STORAGE" }
    };
  }

  try {
    // Prepare data based on field mapping
    let dataToSave: any = {};
    
    if (config.fieldMapping && config.fieldMapping.length > 0) {
      // Use explicit field mapping
      for (const field of config.fieldMapping) {
        const sourceValue = getNestedValue({ payload, ...vars }, field.source.replace(/^\{\{|\}\}$/g, ''));
        let transformedValue = sourceValue;
        
        // Apply transformations
        if (field.transform === "uppercase") {
          transformedValue = String(sourceValue).toUpperCase();
        } else if (field.transform === "lowercase") {
          transformedValue = String(sourceValue).toLowerCase();
        } else if (field.transform === "date") {
          transformedValue = new Date(sourceValue).toISOString();
        }
        
        dataToSave[field.target] = transformedValue;
      }
    } else {
      // Save entire payload
      dataToSave = payload;
    }
    
    // Add timestamp if enabled
    if (config.includeTimestamp !== false) {
      dataToSave.timestamp = new Date().toISOString();
    }

    // Save based on destination
    if (config.destination === "google_sheets") {
      // Call Google Sheets service
      const result = await saveToGoogleSheets(
        config.sheetId,
        config.sheetName,
        dataToSave,
        config.writeMode,
        config.primaryKey,
        config.onConflict
      );
      
      logger.info(`Data saved to Google Sheets: ${config.sheetId}`);
      
      return {
        status: "success",
        data: result,
        next: "success"
      };
    } else if (config.destination === "supabase") {
      // Call Supabase service
      const result = await saveToSupabase(
        config.sheetId, // table name
        dataToSave,
        config.writeMode,
        config.primaryKey,
        config.onConflict
      );
      
      logger.info(`Data saved to Supabase table: ${config.sheetId}`);
      
      return {
        status: "success",
        data: result,
        next: "success"
      };
    } else if (config.destination === "local_storage") {
      // Save to browser local storage
      const key = `workflow_data_${config.sheetId}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(dataToSave));
      
      logger.info(`Data saved to local storage: ${key}`);
      
      return {
        status: "success",
        data: { key, saved: true },
        next: "success"
      };
    }

    return {
      status: "error",
      error: { message: "Unknown destination", code: "UNKNOWN_DESTINATION" }
    };
  } catch (error: any) {
    logger.error(`Storage save failed: ${error.message}`);
    return {
      status: "error",
      error: {
        message: error.message,
        code: "STORAGE_ERROR",
        details: error
      },
      next: "error"
    };
  }
}

async function saveToGoogleSheets(
  sheetId: string,
  sheetName: string,
  data: any,
  writeMode: string,
  primaryKey?: string,
  onConflict?: string
): Promise<any> {
  // Implementation depends on Google Sheets API integration
  // This is a placeholder
  return { success: true, rows: 1 };
}

async function saveToSupabase(
  tableName: string,
  data: any,
  writeMode: string,
  primaryKey?: string,
  onConflict?: string
): Promise<any> {
  // Implementation depends on Supabase integration
  // This is a placeholder
  return { success: true, rows: 1 };
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
}
