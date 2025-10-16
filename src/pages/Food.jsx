import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Food() {
    const [foods, setFoods] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    // State baru untuk metode pembayaran
    const [paymentMethod, setPaymentMethod] = useState(null); // null, 'cash', atau 'qris'
    const [showPaymentModal, setShowPaymentModal] = useState(false); // Untuk menampilkan modal pemilihan metode
    const [currentFoodForOrder, setCurrentFoodForOrder] = useState(null); // Untuk menyimpan produk yang akan dipesan

    useEffect(() => {
        fetch("https://lawaggg.github.io/DanTenAPI/api/foods.json  ") // Perhatikan spasi di akhir URL, mungkin ini typo?
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
        { value: "makanan", label: "🍚 Makanan" },
        { value: "snack", label: "🍿 Snack" },
        { value: "ayam", label: "🍗 Ayam" },
        { value: "nugget", label: "🍤 Nugget" }
    ];

    const filteredFoods = selectedCategory === "all"
        ? foods
        : foods.filter(food =>
            food.category && food.category.includes(selectedCategory)
        );

    // Fungsi untuk menangani klik tombol pesan, menampilkan modal pemilihan metode
    const initiateOrder = (food) => {
        setCurrentFoodForOrder(food);
        setPaymentMethod(null); // Reset metode sebelumnya
        setShowPaymentModal(true);
    };

    // Fungsi untuk menangani konfirmasi pesanan setelah memilih metode
    const confirmOrder = () => {
        if (currentFoodForOrder && paymentMethod) {
            handleOrder(currentFoodForOrder, paymentMethod);
            setShowPaymentModal(false);
            setCurrentFoodForOrder(null);
            setPaymentMethod(null);
        }
    };

    const handleOrder = (food, method) => {
        const description = food.description && food.description !== "null"
            ? food.description
            : "Menu spesial dari DanTen";

        // Menyesuaikan pesan berdasarkan metode pembayaran
        const paymentText = method === 'cash' ? "**Metode Pembayaran: CASH**" : "**Metode Pembayaran: QRIS**";
        const message = `Halo! Saya mau pesan:\n\n🍱 *${food.name}*\n💰 ${food.price}\n📝 ${description}\n\n${paymentText}\n\n_*[ORDER DANUSAN OSIS]*_`;
        const whatsappUrl = `https://wa.me/6283856278811?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

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

                    {/* Floating Elements dengan Fade In */}
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

                    {/* Title dengan Fade In */}
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

                            {/* Double Underline untuk mengikuti kedua bagian */}
                            <motion.span
                                className="absolute bottom-0 left-0 h-[5px] bg-orange-800 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "50%" }} // Hanya sampai "Dan"
                                transition={{
                                    delay: 0.9,
                                    duration: 0.6,
                                    ease: "easeInOut"
                                }}
                            ></motion.span>

                            <motion.span
                                className="absolute top-18 md:top-34 left-[53%] h-[5px] bg-orange-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "45%" }} // Mulai dari posisi "Ten"
                                transition={{
                                    delay: 1.1,
                                    duration: 0.6,
                                    ease: "easeInOut"
                                }}
                            ></motion.span>
                        </motion.h1>
                    </motion.div>
                </div>

                {/* Category Select Section dengan Fade In */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="bg-white/70 backdrop-blur-md border-t border-orange-200 py-6"
                >
                    <div className="max-w-6xl mx-auto px-4">
                        {/* Mobile view: Centered below banner */}
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

                        {/* Desktop view: Moved to right side, looks clean */}
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

            {/* Main Content dengan Fade In */}
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="relative z-10 max-w-6xl mx-auto px-4 py-8"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredFoods.map((food, index) => (
                        <motion.div
                            key={food.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 1.5 + (index * 0.1),
                                duration: 0.5
                            }}
                            className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                        >
                            {/* Image */}
                            <div
                                className="h-60 sm:h-80 bg-gray-100 cursor-pointer overflow-hidden"
                                onClick={() => setSelectedFood(food)}
                            >
                                <img
                                    src={food.image_url}
                                    alt={food.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight flex-1">
                                        {food.name}
                                    </h3>
                                    <span className="text-orange-600 font-bold text-sm bg-orange-50 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                                        {food.price}
                                    </span>
                                </div>

                                {/* Tombol Pesan Sekarang sekarang memicu modal pemilihan metode */}
                                <button
                                    onClick={() => initiateOrder(food)}
                                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    🛒 Pesan Sekarang
                                </button>
                            </div>
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

            {/* Modal Pemilihan Metode Pembayaran (baru) */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        // onClick={() => setShowPaymentModal(false)} // Tidak menutup jika klik luar
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Jangan tutup jika klik di dalam modal
                        >
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Pilih Metode Pembayaran</h2>
                                <p className="text-gray-600 mb-6 text-center">Untuk pesanan: <strong>{currentFoodForOrder?.name}</strong></p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`w-full py-4 px-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                                            paymentMethod === 'cash'
                                                ? 'bg-green-500 text-white' // Jika dipilih, warna hijau
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200' // Warna default
                                        }`}
                                    >
                                        💰 Bayar Cash
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('qris')}
                                        className={`w-full py-4 px-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                                            paymentMethod === 'qris'
                                                ? 'bg-green-500 text-white' // Jika dipilih, warna hijau
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200' // Warna default
                                        }`}
                                    >
                                        📱 Bayar QRIS
                                    </button>
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setCurrentFoodForOrder(null);
                                            setPaymentMethod(null);
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmOrder}
                                        disabled={!paymentMethod} // Disable jika belum memilih metode
                                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors duration-200 ${
                                            paymentMethod
                                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                : 'bg-orange-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Konfirmasi Pesanan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Food Detail Modal */}
            <AnimatePresence>
                {selectedFood && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedFood(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative h-80">
                                <img
                                    src={selectedFood.image_url}
                                    alt={selectedFood.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => setSelectedFood(null)}
                                    className="absolute top-3 right-3 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors duration-200 text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800 pr-2 flex-1">
                                        {selectedFood.name}
                                    </h2>
                                    <span className="text-orange-600 text-xl font-bold whitespace-nowrap">
                                        {selectedFood.price}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    {selectedFood.category && selectedFood.category.map((cat, index) => (
                                        <span
                                            key={index}
                                            className="inline-block bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                                    {selectedFood.description && selectedFood.description !== "null"
                                        ? selectedFood.description
                                        : "Menu spesial DanTen yang dibuat dengan bahan-bahan fresh dan berkualitas. Cocok untuk teman belajar maupun santai bersama teman."}
                                </p>

                                <button
                                    onClick={() => initiateOrder(selectedFood)}
                                    className="w-full bg-orange-500 text-white py-4 px-4 rounded-xl font-bold text-lg hover:bg-orange-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    🛒 Pesan Sekarang
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer dengan Fade In */}
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