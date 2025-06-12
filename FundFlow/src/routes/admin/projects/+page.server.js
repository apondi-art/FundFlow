export function load() {
    // Mock data - replace with actual database queries
    const projects = [
        {
            id: 1,
            title: "Build a Well in Kajiado",
            description: "Help us build a clean water well for the Kajiado community",
            goalAmount: 500000,
            currentAmount: 125000,
            imageUrl: ""
        },
        {
            id: 2,
            title: "School Supplies for Children",
            description: "Provide books, pencils and uniforms for 100 children",
            goalAmount: 250000,
            currentAmount: 75000,
            imageUrl: ""
        },
        {
            id: 3,
            title: "Medical Camp",
            description: "Free medical camp for 3 days in rural areas",
            goalAmount: 300000,
            currentAmount: 50000,
            imageUrl: ""
        }
    ];

    return { projects };
}