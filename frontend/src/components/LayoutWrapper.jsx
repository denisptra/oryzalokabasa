"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const LayoutWrapper = ({ children }) => {
    const pathname = usePathname();

    // Routes that should NOT show navbar and footer
    const hideLayout =
        pathname.startsWith("/panel-admin") ||
        pathname.startsWith("/sistem-masuk") ||
        pathname.startsWith("/sistem-daftar");

    if (hideLayout) {
        return <main>{children}</main>;
    }

    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
};
