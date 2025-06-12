// src/app.d.ts
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: { 
        username: string;
        admin: boolean;  // Explicit admin flag
      } | null;
    }
    interface PageData {
      user: {
        username: string;
        admin: boolean;
      } | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};