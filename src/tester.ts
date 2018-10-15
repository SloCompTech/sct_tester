/**
 * Generic tester class with common properties
 */
export abstract class Tester {

    // Property
    protected abstract cExtensions: string[]; // File extensions that this tester supports

    public get extensions(): string[] {
        return this.cExtensions;
    }
    
    // Main
    public abstract test(file: string, onTest:(cmd: string) => any): void;
}