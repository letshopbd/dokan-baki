import CustomerDetailsClient from "@/components/client-pages/CustomerDetailsClient";

export default async function Page({ params }) {
    const { id } = await params;
    return <CustomerDetailsClient id={id} />;
}
