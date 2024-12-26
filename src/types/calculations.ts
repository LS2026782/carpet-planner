import { MeasurementUnit } from './settings';

/**
 * Room measurement data
 */
export interface RoomMeasurements {
    area: number;
    perimeter: number;
    width: number;
    length: number;
}

/**
 * Material calculation data
 */
export interface MaterialCalculations {
    carpetArea: number;
    paddingArea: number;
    wastePercentage: number;
    totalArea: number;
}

/**
 * Cost calculation data
 */
export interface CostCalculations {
    carpetCost: number;
    paddingCost: number;
    laborCost: number;
    totalCost: number;
}

/**
 * All calculation results
 */
export interface CalculationResults {
    measurements: RoomMeasurements;
    materials: MaterialCalculations;
    costs: CostCalculations;
    unit: MeasurementUnit;
}

/**
 * Panel initialization options
 */
export interface CalculationsPanelOptions {
    container: HTMLElement;
    units: MeasurementUnit;
    onUnitChange?: (unit: MeasurementUnit) => void;
}

/**
 * Material cost configuration
 */
export interface MaterialCosts {
    carpetPerUnit: number;
    paddingPerUnit: number;
    laborPerUnit: number;
}

/**
 * Events emitted by the calculations panel
 */
export interface CalculationsPanelEvents {
    unitChange: MeasurementUnit;
    update: CalculationResults;
}
