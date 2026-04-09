import "next-auth";
import "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    role?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}
