import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    orderBy,
    Timestamp,
    collectionGroup,
    writeBatch
} from "firebase/firestore";
import { db } from "./config";

// --- Customers ---

export const getCustomers = async () => {
    const q = query(collection(db, "customers"), orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCustomer = async (id) => {
    const docRef = doc(db, "customers", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
};

export const addCustomer = async (data) => {
    try {
        const docRef = await addDoc(collection(db, "customers"), {
            ...data,
            totalBaki: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return { id: docRef.id, error: null };
    } catch (error) {
        return { id: null, error: error.message };
    }
};

export const updateCustomer = async (id, data) => {
    try {
        const docRef = doc(db, "customers", id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

export const deleteCustomer = async (id) => {
    try {
        // Delete all transactions first
        const transactionsRef = collection(db, "customers", id, "transactions");
        const transactionsSnapshot = await getDocs(transactionsRef);

        const batch = writeBatch(db);
        transactionsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Then delete the customer
        await deleteDoc(doc(db, "customers", id));
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

// --- Transactions / Baki History ---
// Sub-collection approach: customers/{customerId}/transactions

export const addTransaction = async (customerId, data) => {
    // data: { amount, type, description, date (optional), items (optional) }
    const { amount, type, description = "", date, items } = data;

    try {
        const customerRef = doc(db, "customers", customerId);
        const customerSnap = await getDoc(customerRef);

        if (!customerSnap.exists()) throw new Error("Customer not found");

        const currentBaki = customerSnap.data().totalBaki || 0;
        const newBaki = type === 'DUE' ? currentBaki + Number(amount) : currentBaki - Number(amount);

        // 1. Add transaction record
        await addDoc(collection(db, "customers", customerId, "transactions"), {
            amount: Number(amount),
            type,
            description,
            date: date ? Timestamp.fromDate(new Date(date)) : Timestamp.now(),
            items: items || null
        });

        // 2. Update customer total baki
        await updateDoc(customerRef, {
            totalBaki: newBaki,
            updatedAt: Timestamp.now()
        });

        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

export const getTransactions = async (customerId) => {
    const q = query(
        collection(db, "customers", customerId, "transactions"),
        orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllTransactions = async () => {
    // Uses collectionGroup query to fetch all documents from "transactions" subcollections
    // Note: This might require an index if we add complex filtering later.
    // For now, we fetch all and sort in memory to avoid index blocking.
    const q = query(collectionGroup(db, "transactions"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        customerId: doc.ref.parent.parent.id,
        ...doc.data()
    }));
};
