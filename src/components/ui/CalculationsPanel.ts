import { EventEmitter } from '../../utils/EventEmitter';
import {
    CalculationsPanelOptions,
    CalculationsPanelEvents,
    CalculationResults,
    MaterialCosts,
    RoomMeasurements,
    MaterialCalculations,
    CostCalculations
} from '../../types/calculations';
import { MeasurementUnit } from '../../types/settings';

/**
 * Panel for displaying room measurements and cost calculations
 * @extends EventEmitter<CalculationsPanelEvents>
 */
export class CalculationsPanel extends EventEmitter<CalculationsPanelEvents> {
    private container: HTMLElement;
    private panel: HTMLElement;
    private currentUnit: MeasurementUnit;
    private onUnitChange?: (unit: MeasurementUnit) => void;
    private lastCalculation: CalculationResults | null = null;

    private readonly defaultMaterialCosts: MaterialCosts = {
        carpetPerUnit: 25, // Cost per square unit
        paddingPerUnit: 5, // Cost per square unit
        laborPerUnit: 10, // Cost per square unit
    };

    /**
     * Creates a new CalculationsPanel instance
     * @param options - Panel initialization options
     * @throws {Error} If container is null or undefined
     */
    constructor({ container, units, onUnitChange }: CalculationsPanelOptions) {
        super();

        if (!container) {
            throw new Error('Calculations panel container element is required');
        }

        this.container = container;
        this.currentUnit = units;
        this.onUnitChange = onUnitChange;
        this.panel = document.createElement('div');

        try {
            this.createPanel();
        } catch (error) {
            console.error('Failed to initialize calculations panel:', error);
            throw error;
        }
    }

    /**
     * Creates the calculations panel interface
     * @private
     */
    private createPanel(): void {
        this.panel.className = 'calculations-panel';
        this.panel.setAttribute('role', 'region');
        this.panel.setAttribute('aria-label', 'Room calculations');

        // Create sections
        this.createMeasurementsSection();
        this.createMaterialsSection();
        this.createCostsSection();
        this.createUnitToggle();

        this.container.appendChild(this.panel);
    }

    /**
     * Creates the measurements section
     * @private
     */
    private createMeasurementsSection(): void {
        const section = this.createSection('Room Measurements');
        section.setAttribute('aria-live', 'polite');

        ['area', 'perimeter', 'width', 'length'].forEach(measurement => {
            const row = document.createElement('div');
            row.className = 'calculation-row';
            row.id = `measurement-${measurement}`;

            const label = document.createElement('span');
            label.className = 'calculation-label';
            label.textContent = this.formatLabel(measurement);

            const value = document.createElement('span');
            value.className = 'calculation-value';
            value.setAttribute('aria-label', `${this.formatLabel(measurement)} value`);

            row.appendChild(label);
            row.appendChild(value);
            section.appendChild(row);
        });
    }

    /**
     * Creates the materials section
     * @private
     */
    private createMaterialsSection(): void {
        const section = this.createSection('Materials Required');
        section.setAttribute('aria-live', 'polite');

        ['carpetArea', 'paddingArea', 'wastePercentage', 'totalArea'].forEach(material => {
            const row = document.createElement('div');
            row.className = 'calculation-row';
            row.id = `material-${material}`;

            const label = document.createElement('span');
            label.className = 'calculation-label';
            label.textContent = this.formatLabel(material);

            const value = document.createElement('span');
            value.className = 'calculation-value';
            value.setAttribute('aria-label', `${this.formatLabel(material)} value`);

            row.appendChild(label);
            row.appendChild(value);
            section.appendChild(row);
        });
    }

    /**
     * Creates the costs section
     * @private
     */
    private createCostsSection(): void {
        const section = this.createSection('Cost Estimates');
        section.setAttribute('aria-live', 'polite');

        ['carpetCost', 'paddingCost', 'laborCost', 'totalCost'].forEach(cost => {
            const row = document.createElement('div');
            row.className = 'calculation-row';
            row.id = `cost-${cost}`;

            const label = document.createElement('span');
            label.className = 'calculation-label';
            label.textContent = this.formatLabel(cost);

            const value = document.createElement('span');
            value.className = 'calculation-value';
            value.setAttribute('aria-label', `${this.formatLabel(cost)} value`);

            row.appendChild(label);
            row.appendChild(value);
            section.appendChild(row);
        });
    }

    /**
     * Creates the unit toggle control
     * @private
     */
    private createUnitToggle(): void {
        const container = document.createElement('div');
        container.className = 'unit-toggle';

        const label = document.createElement('label');
        label.textContent = 'Measurement Units:';
        label.htmlFor = 'unit-select';

        const select = document.createElement('select');
        select.id = 'unit-select';
        select.setAttribute('aria-label', 'Select measurement units');

        const options = [
            { value: 'feet', label: 'Feet' },
            { value: 'meters', label: 'Meters' }
        ];

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === this.currentUnit) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        select.addEventListener('change', () => {
            this.setUnit(select.value as MeasurementUnit);
        });

        container.appendChild(label);
        container.appendChild(select);
        this.panel.appendChild(container);
    }

    /**
     * Creates a section with a title
     * @private
     */
    private createSection(title: string): HTMLElement {
        const section = document.createElement('div');
        section.className = 'calculations-section';
        section.setAttribute('role', 'region');
        section.setAttribute('aria-label', title);

        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);

        return section;
    }

    /**
     * Updates the displayed calculations
     */
    updateCalculations(measurements: RoomMeasurements): void {
        const materials = this.calculateMaterials(measurements);
        const costs = this.calculateCosts(materials);

        const results: CalculationResults = {
            measurements,
            materials,
            costs,
            unit: this.currentUnit
        };

        this.lastCalculation = results;
        this.updateDisplay(results);
        this.emit('update', results);
    }

    /**
     * Calculates material requirements
     * @private
     */
    private calculateMaterials(measurements: RoomMeasurements): MaterialCalculations {
        const wastePercentage = 0.1; // 10% waste
        const carpetArea = measurements.area;
        const paddingArea = measurements.area;
        const totalArea = carpetArea * (1 + wastePercentage);

        return {
            carpetArea,
            paddingArea,
            wastePercentage: wastePercentage * 100,
            totalArea
        };
    }

    /**
     * Calculates costs based on materials
     * @private
     */
    private calculateCosts(materials: MaterialCalculations): CostCalculations {
        const carpetCost = materials.totalArea * this.defaultMaterialCosts.carpetPerUnit;
        const paddingCost = materials.paddingArea * this.defaultMaterialCosts.paddingPerUnit;
        const laborCost = materials.totalArea * this.defaultMaterialCosts.laborPerUnit;

        return {
            carpetCost,
            paddingCost,
            laborCost,
            totalCost: carpetCost + paddingCost + laborCost
        };
    }

    /**
     * Updates the display with calculation results
     * @private
     */
    private updateDisplay(results: CalculationResults): void {
        // Update measurements
        Object.entries(results.measurements).forEach(([key, value]) => {
            const element = document.getElementById(`measurement-${key}`);
            if (element) {
                const valueElement = element.querySelector('.calculation-value');
                if (valueElement) {
                    valueElement.textContent = this.formatValue(value, key.includes('area'));
                }
            }
        });

        // Update materials
        Object.entries(results.materials).forEach(([key, value]) => {
            const element = document.getElementById(`material-${key}`);
            if (element) {
                const valueElement = element.querySelector('.calculation-value');
                if (valueElement) {
                    valueElement.textContent = this.formatValue(value, key.includes('Area'));
                }
            }
        });

        // Update costs
        Object.entries(results.costs).forEach(([key, value]) => {
            const element = document.getElementById(`cost-${key}`);
            if (element) {
                const valueElement = element.querySelector('.calculation-value');
                if (valueElement) {
                    valueElement.textContent = this.formatCurrency(value);
                }
            }
        });
    }

    /**
     * Sets the measurement unit
     */
    setUnit(unit: MeasurementUnit): void {
        if (this.currentUnit === unit) return;

        this.currentUnit = unit;
        if (this.onUnitChange) {
            this.onUnitChange(unit);
        }
        this.emit('unitChange', unit);

        // Update display if we have calculations
        if (this.lastCalculation) {
            this.updateDisplay({ ...this.lastCalculation, unit });
        }
    }

    /**
     * Formats a label for display
     * @private
     */
    private formatLabel(key: string): string {
        return key
            .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }

    /**
     * Formats a value for display
     * @private
     */
    private formatValue(value: number, isArea: boolean): string {
        const formatted = value.toFixed(2);
        const unit = this.currentUnit === 'feet' ? 'ft' : 'm';
        return `${formatted} ${unit}${isArea ? '²' : ''}`;
    }

    /**
     * Formats a currency value
     * @private
     */
    private formatCurrency(value: number): string {
        return `$${value.toFixed(2)}`;
    }

    /**
     * Gets the current measurement unit
     */
    getUnit(): MeasurementUnit {
        return this.currentUnit;
    }

    /**
     * Gets the last calculation results
     */
    getLastCalculation(): CalculationResults | null {
        return this.lastCalculation;
    }

    /**
     * Cleans up the panel and removes event listeners
     */
    destroy(): void {
        this.panel.remove();
        this.removeAllListeners();
    }
}
