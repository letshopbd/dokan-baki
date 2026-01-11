import AddBakiClient from "@/components/client-pages/AddBakiClient";

export default async function Page({ params }) {
    const { id } = await params;
    return <AddBakiClient id={id} />;
}
