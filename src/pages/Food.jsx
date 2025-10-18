import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FoodList() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        fetch("https://lawaggg.github.io/DanTenAPI/api/foods.json")
            .then((response) => response.json())
            .then((data) => {
                setFoods(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, []);

    const categories = [
        { value: "all", label: "🍽️ Semua Menu" },
        { value: "snack", label: "🍿 Snack" },
        { value: "ayam", label: "🍗 Ayam" },
        { value: "nugget", label: "🍤 Nugget" }
    ];

    const filteredFoods = selectedCategory === "all"
        ? foods
        : foods.filter(food =>
            food.category && food.category.includes(selectedCategory)
        );

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center"
            >
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-orange-700">Memuat menu...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-gradient-to-b from-orange-300 to-orange-400"
        >
            <div
                className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
                style={{ backgroundImage: "url('./Bg.png')" }}
            ></div>

            <header className="relative z-10">
                <div
                    className="relative bg-gradient-to-b from-orange-100 to-orange-200 text-center py-16 md:py-24 overflow-hidden"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-90 blur-xs"
                        style={{ backgroundImage: "url('./banner.png')" }}
                    ></div>

                    <div className="absolute inset-0 bg-gradient-to-b from-orange-50/70 to-orange-200/60"></div>

                    <motion.div
                        className="absolute hidden md:block top-20 left-7 md:top-20 md:left-100 text-4xl md:text-6xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="h-10 w-10 md:h-16 md:w-16"
                        >
                            <img src="./delicious_1.webp" alt="" className="w-full h-full object-cover" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="absolute hidden md:block bottom-17 right-8 md:bottom-10 md:right-100 text-4xl md:text-6xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="h-10 w-10 md:h-16 md:w-16"
                        >
                            <img src="./delicious.png" alt="" className="w-full h-full object-cover" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="absolute bottom-17 right-80 md:bottom-10 md:left-100 text-4xl md:text-6xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                    >
                        <motion.div
                            animate={{
                                y: [0, -3, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="h-10 w-10 md:h-16 md:w-16"
                        >
                            <img src="./hamburger.png" alt="" className="w-full h-full object-cover" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="absolute bottom-17 right-8 md:top-20 md:right-105 text-4xl md:text-6xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.8 }}
                    >
                        <motion.div
                            animate={{
                                y: [0, -3, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="h-10 w-10 md:h-16 md:w-16"
                        >
                            <img src="./broccoli.png" alt="" className="w-full h-full object-cover" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <motion.h1
                            className="font-serif relative inline-block text-6xl font-bold md:text-9xl text-orange-700 drop-shadow-sm flex justify-center items-baseline"
                        >
                            {["D", "a", "n", "T", "e", "n"].map((letter, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ y: 80, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: 0.2 + index * 0.1,
                                        duration: 0.5,
                                        ease: "easeOut"
                                    }}
                                    className={`inline-block ${index >= 3 ? 'relative top-4 text-orange-900 md:top-4' : ''}`}
                                >
                                    {letter}
                                </motion.span>
                            ))}

                            <motion.span
                                className="absolute bottom-0 left-0 h-[5px] bg-orange-800 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "50%" }}
                                transition={{
                                    delay: 0.9,
                                    duration: 0.6,
                                    ease: "easeInOut"
                                }}
                            ></motion.span>

                            <motion.span
                                className="absolute top-18 md:top-34 left-[53%] h-[5px] bg-orange-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "45%" }}
                                transition={{
                                    delay: 1.1,
                                    duration: 0.6,
                                    ease: "easeInOut"
                                }}
                            ></motion.span>
                        </motion.h1>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="bg-white/70 backdrop-blur-md border-t border-orange-200 py-6"
                >
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex flex-col items-center md:hidden">
                            <label className="text-orange-700 font-semibold mb-3 text-lg">
                                Pilih Kategori:
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-6 py-3 bg-white border-2 border-orange-300 rounded-xl text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-medium shadow-md w-full max-w-xs"
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="hidden md:flex justify-end items-center">
                            <label className="text-orange-700 font-semibold mr-3 text-lg">
                                Kategori:
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-5 py-2 bg-white border-2 border-orange-300 rounded-lg text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base font-medium shadow-sm"
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>
            </header>

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="relative z-10 max-w-6xl mx-auto px-4 py-8"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredFoods.map((food) => (
                        <motion.div
                            className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                        >
                            <Link to={`/food/${food.id}`}>
                                <div className="h-60 sm:h-80 bg-gray-100 cursor-pointer overflow-hidden">
                                    <img
                                        src={food.image_url}
                                        alt={food.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight flex-1">
                                            {food.name}
                                        </h3>
                                        <span className="text-orange-600 font-bold text-sm bg-orange-50 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                                            {food.price}
                                        </span>
                                    </div>

                                    <div className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold text-center">
                                        Lihat Detail
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {filteredFoods.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.6 }}
                        className="text-center py-12"
                    >
                        <p className="text-gray-500 text-lg">Tidak ada menu ditemukan untuk kategori ini</p>
                    </motion.div>
                )}
            </motion.main>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.6 }}
                className="relative z-10 bg-orange-900 text-white text-center py-8 mt-12"
            >
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-orange-200 text-lg mb-2">
                        &copy; 2025 OSIS 58 - Pendanaan
                    </p>
                </div>
            </motion.footer>
        </motion.div>
    );
}