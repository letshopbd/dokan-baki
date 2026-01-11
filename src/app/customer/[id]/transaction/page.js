import AddTransactionClient from "@/components/client-pages/AddTransactionClient";

export default async function Page({ params, searchParams }) {
    const { id } = await params;
    const { type } = await searchParams;
    return <AddTransactionClient id={id} type={type} />;
}
