import ItemCard from "./ItemCard"

function ItemList({ items, onEdit, onDelete, loading }) {
    if (loading) {
        return (
            <div style={styles.loadingWrapper}>
                <div style={styles.spinner}></div>
                <p style={styles.message}>Memuat data...</p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div style={styles.empty}>
                <p style={styles.emptyIcon}>📭</p>
                <p style={styles.emptyText}>Belum ada item.</p>
                <p style={styles.emptyHint}>
                    Gunakan form di atas untuk menambahkan item pertama.
                </p>
            </div>
        )
    }

    return (
        <div style={styles.grid}>
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "1rem",
    },
    loadingWrapper: {
        textAlign: "center",
        padding: "3rem",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid #e0e0e0",
        borderTop: "4px solid #1F4E79",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 1rem auto",
    },
    message: {
        textAlign: "center",
        color: "#888",
        padding: "0",
        fontSize: "1.1rem",
        margin: 0,
    },
    empty: {
        textAlign: "center",
        padding: "3rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        border: "2px dashed #ddd",
    },
    emptyIcon: {
        fontSize: "3rem",
        margin: "0 0 0.5rem 0",
    },
    emptyText: {
        fontSize: "1.1rem",
        color: "#555",
        margin: "0 0 0.25rem 0",
    },
    emptyHint: {
        fontSize: "0.9rem",
        color: "#888",
        margin: 0,
    },
}

export default ItemList
