// api/weather.js
export default async function handler(req, res) {
    const { city } = req.query;
    const apiKey = process.env.WEATHER_API_KEY; // Grabs the key safely from Vercel's Environment Variables

    if (!city) {
        return res.status(400).json({ error: "City is required" });
    }

    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=yes`
        );
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch weather data" });
    }
}