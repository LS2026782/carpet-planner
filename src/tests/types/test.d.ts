/// <reference types="node" />
/// <reference types="@playwright/test" />

declare namespace NodeJS {
    interface ProcessEnv {
        THEME?: string;
        CI?: string;
    }
}
