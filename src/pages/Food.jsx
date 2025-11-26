import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FoodList() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [cart, setCart] = useState([]);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showQRISModal, setShowQRISModal] = useState(false);
    const [cartAnimation, setCartAnimation] = useState({
        show: false,
        itemName: '',
        position: { x: 0, y: 0 }
    });

    const [checkoutData, setCheckoutData] = useState({
        nama: '',
        kelas: '',
        nomor_telpon: '',
        notes: '',
        tipe_pembayaran: '',
    });

    useEffect(() => {
        const url = "https://docs.google.com/spreadsheets/d/1Iza2Ys74RNG_x5WjHW8QcqxXlhD0ldqwuxHFra05jIY/gviz/tq?tqx=out:json";

        fetch(url)
            .then(res => res.text())
            .then(text => {
                const jsonText = text
                    .replace(/^[^\(]*\(/, "")
                    .replace(/\);?$/, "");
                const json = JSON.parse(jsonText);

                const cols = json.table.cols.map(col => col.label);
                const rows = json.table.rows.map((row, index) => {
                    const obj = {};
                    row.c.forEach((cell, i) => {
                        obj[cols[i]] = cell ? cell.v : null;
                    });
                    obj.id = index;
                    return obj;
                });

                setFoods(rows);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetch spreadsheet:", error);
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

    // Fungsi untuk cart
    const addToCart = (food,event) => {
        const existingItem = cart.find(item => item.id === food.id);

        if (existingItem) {
            setCart(cart.map(item =>
                item.id === food.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...food, quantity: 1 }]);
        }

        if (event) {
            const rect = event.target.getBoundingClientRect();
            setCartAnimation({
                show: true,
                itemName: food.name,
                position: {
                    x: rect.left + rect.width / 2,
                    y: rect.top
                }
            });

            // Auto hide animation after 1.5 seconds
            setTimeout(() => {
                setCartAnimation({
                    show: false,
                    itemName: '',
                    position: { x: 0, y: 0 }
                });
            }, 1500);
        }
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(id);
            return;
        }
        setCart(cart.map(item =>
            item.id === id
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const extractPrice = (priceString) => {
        const priceMatch = priceString.match(/Rp\s*([0-9.,]+)/);
        if (priceMatch) {
            const price = priceMatch[1].replace(/\./g, '');
            return parseInt(price) || 0;
        }
        return 0;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID').format(price);
    };

    // Fungsi untuk checkout
    const handleCheckout = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!checkoutData.nama.trim() || !checkoutData.kelas.trim() || !checkoutData.nomor_telpon.trim() || !checkoutData.tipe_pembayaran) {
            alert('Silakan lengkapi semua data!');
            setSubmitting(false);
            return;
        }

        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!phoneRegex.test(checkoutData.nomor_telpon)) {
            alert('Format nomor telepon tidak valid!');
            setSubmitting(false);
            return;
        }

        // SIMPAN DATA CART SEBELUM DIKOSONGKAN
        const cartBackup = [...cart];
        const checkoutDataBackup = { ...checkoutData };

        try {
            const url = "https://script.google.com/macros/s/AKfycbzU6f5sawaOMOQifg4A1zddT1UaoDeDRBABIlXHWpb2Lbp8uOe7Bbwb-OqCP9IRf9gL/exec";

            for (const item of cart) {
                const totalHarga = extractPrice(item.price) * item.quantity;
                const bodyData = `timestamp=${encodeURIComponent(new Date().toLocaleString('id-ID'))}&nama=${encodeURIComponent(checkoutData.nama)}&kelas=${encodeURIComponent(checkoutData.kelas)}&nomor_telpon=${encodeURIComponent(checkoutData.nomor_telpon)}&makanan=${encodeURIComponent(item.name)}&jumlah_pesanan=${item.quantity}&total_harga=${totalHarga}&notes=${encodeURIComponent(checkoutData.notes)}&tipe_pembayaran=${encodeURIComponent(checkoutData.tipe_pembayaran)}`;

                await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: bodyData
                });
            }

            setShowSuccessModal(true);
            setTimeout(() => {
                setCart([]);
                localStorage.removeItem('danten_cart');
                setCheckoutData({
                    nama: '',
                    kelas: '',
                    nomor_telpon: '',
                    notes: '',
                    tipe_pembayaran: '',
                });
                setShowCheckoutModal(false);
                setSubmitting(false);
            }, 10000);

        } catch (error) {
            console.error("Error dalam checkout:", error);
            // GUNAKAN DATA BACKUP UNTUK WHATSAPP
            openWhatsAppCheckout(cartBackup, checkoutDataBackup);
            setSubmitting(false);
        }
    };

    // Update fungsi openWhatsAppCheckout untuk menerima parameter
    const openWhatsAppCheckout = (cartData = cart, checkoutDataParam = checkoutData) => {
        const totalHarga = calculateCartTotal(cartData);
        const itemsText = cartData.map(item =>
            `• ${item.name} (${item.quantity} pcs) - Rp ${formatPrice(extractPrice(item.price) * item.quantity)}`
        ).join('\n');

        const paymentMethod = checkoutDataParam.tipe_pembayaran === 'qris' ? 'QRIS (berikan bukti tf)' : 'Cash';
        const notesText = checkoutDataParam.notes && checkoutDataParam.notes.trim() !== "" ? checkoutDataParam.notes : "-";

        const message = `Halo! Saya mau pesan:\n\n${itemsText}\n\n• Total: Rp ${formatPrice(totalHarga)},-\n• Metode Bayar: ${paymentMethod}\n• Notes/Request: ${notesText}\n\n• *Pemesan:*\nNama: ${checkoutDataParam.nama}\nKelas: ${checkoutDataParam.kelas}\nTelpon: ${checkoutDataParam.nomor_telpon}\n\n_*[ORDER DANTEN]*_`;

        const whatsappUrl = `https://wa.me/6283856278811?text=${encodeURIComponent(message)}`;

        setTimeout(() => {
            window.open(whatsappUrl, "_blank");
        }, 300);

        setShowSuccessModal(false);
        setShowCheckoutModal(false);
        setShowCartModal(false);
    };

    const calculateCartTotal = (cartData = cart) => {
        return cartData.reduce((total, item) => {
            const price = extractPrice(item.price);
            return total + (price * item.quantity);
        }, 0);
    };

    // Load cart dari localStorage saat komponen mount
    useEffect(() => {
        const savedCart = localStorage.getItem('danten_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                setCart([]);
            }
        }
    }, []);

    // Save cart ke localStorage setiap kali cart berubah
    useEffect(() => {
        localStorage.setItem('danten_cart', JSON.stringify(cart));
    }, [cart]);

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
            <button
                onClick={() => setShowCartModal(true)}
                className="z-50 shadow-xl bg-white text-orange-500 border-2 border-amber-600 p-4 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2 fixed bottom-5 right-2"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                )}
            </button>
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
                        className="absolute bottom-17 left-7 md:bottom-10 md:left-100 text-4xl md:text-6xl"
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
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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

                            <div className="hidden md:flex items-center">
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

                            {/* Tombol Cart */}

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
                            key={food.id}
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
                            </Link>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight flex-1">
                                        {food.name}
                                    </h3>
                                    <span className="text-orange-600 font-bold text-sm bg-orange-50 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                                        {food.price}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/food/${food.id}`}
                                        className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold text-center hover:bg-orange-600 transition-colors"
                                    >
                                        Lihat Detail
                                    </Link>
                                    <button
                                        onClick={(e) => addToCart(food, e)}
                                        className="bg-green-500 text-white py-3 px-5 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center relative overflow-hidden"
                                    >
                                        <span className="text-lg">+</span>

                                        {/* Ripple Effect */}
                                        <span className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-xl"></span>
                                    </button>
                                </div>
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

            {/* Modal Cart */}
            <AnimatePresence>
                {showCartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Keranjang Belanja</h3>
                                <button
                                    onClick={() => setShowCartModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-6">
                                {cart.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Keranjang kosong</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                                    <p className="text-orange-600 font-bold">{item.price}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 bg-gray-200 rounded-full text-center flex items-center justify-center hover:bg-gray-300"
                                                    >
                                                        <span>+</span>
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 ml-2"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-semibold">Total:</span>
                                        <span className="text-xl font-bold text-orange-600">
                                            Rp {formatPrice(calculateCartTotal())},-
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowCartModal(false);
                                            setShowCheckoutModal(true);
                                        }}
                                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                                    >
                                        Checkout
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Add to Cart Notification */}
            <AnimatePresence>
                {cartAnimation.show && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.8,
                            x: cartAnimation.position.x,
                            y: cartAnimation.position.y
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: typeof window !== 'undefined' ? window.innerWidth - 100 : 0,
                            y: 100
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.5,
                            transition: { duration: 0.2 }
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                        className="fixed z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-green-300 max-w-xs"
                        style={{
                            left: cartAnimation.position.x,
                            top: cartAnimation.position.y
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                className="w-6 h-6 bg-white text-green-500 rounded-full flex items-center justify-center"
                            >
                                ✓
                            </motion.div>
                            <div>
                                <p className="font-semibold text-sm">Ditambahkan ke Keranjang!</p>
                                <p className="text-xs opacity-90 truncate">{cartAnimation.itemName}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 1.5, ease: "linear" }}
                            className="absolute bottom-0 left-0 right-0 h-1 bg-green-300 rounded-b-xl origin-left"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Checkout */}
            <AnimatePresence>
                {showCheckoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Checkout Pesanan</h3>
                                <button
                                    onClick={() => setShowCheckoutModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleCheckout} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Nama Lengkap *
                                        </label>
                                        <input
                                            type="text"
                                            value={checkoutData.nama}
                                            onChange={(e) => setCheckoutData(prev => ({ ...prev, nama: e.target.value }))}
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Kelas *
                                        </label>
                                        <input
                                            type="text"
                                            value={checkoutData.kelas}
                                            onChange={(e) => setCheckoutData(prev => ({ ...prev, kelas: e.target.value }))}
                                            placeholder="Contoh: XI RPL"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Nomor Telepon *
                                        </label>
                                        <input
                                            type="tel"
                                            value={checkoutData.nomor_telpon}
                                            onChange={(e) => setCheckoutData(prev => ({ ...prev, nomor_telpon: e.target.value }))}
                                            placeholder="Contoh: 081234567890"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Notes/Catatan
                                        </label>
                                        <input
                                            type="text"
                                            value={checkoutData.notes}
                                            onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Catatan untuk semua pesanan"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200">
                                    <label className="block text-gray-700 font-semibold mb-3">
                                        Tipe Pembayaran *
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCheckoutData(prev => ({ ...prev, tipe_pembayaran: 'cash' }));
                                                setShowQRISModal(false);
                                            }}
                                            className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${checkoutData.tipe_pembayaran === 'cash'
                                                ? 'bg-green-500 text-white border-green-600 shadow-lg'
                                                : 'bg-white text-gray-700 border-orange-300 hover:bg-orange-50'
                                                }`}
                                        >
                                            💵 Cash
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCheckoutData(prev => ({ ...prev, tipe_pembayaran: 'qris' }));
                                                setShowQRISModal(true);
                                            }}
                                            className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${checkoutData.tipe_pembayaran === 'qris'
                                                ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                                                : 'bg-white text-gray-700 border-orange-300 hover:bg-orange-50'
                                                }`}
                                        >
                                            📱 QRIS
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Ringkasan Pesanan:</h4>
                                    <div className="space-y-2 mb-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.name} × {item.quantity}</span>
                                                <span>Rp {formatPrice(extractPrice(item.price) * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span className="text-orange-600">Rp {formatPrice(calculateCartTotal())},-</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!checkoutData.nama || !checkoutData.kelas || !checkoutData.nomor_telpon || !checkoutData.tipe_pembayaran || submitting}
                                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${checkoutData.nama && checkoutData.kelas && checkoutData.nomor_telpon && checkoutData.tipe_pembayaran && !submitting
                                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                                        : 'bg-orange-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {submitting ? 'Memproses...' : 'Pesan Sekarang!'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Success */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <span className="text-white text-2xl">✓</span>
                            </motion.div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Pesanan Berhasil!
                            </h3>

                            <p className="text-gray-600 mb-6">
                                Data sudah tersimpan di sistem. Membuka WhatsApp...
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    openWhatsAppCheckout();
                                }}
                                className="bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                            >
                                Konfirmasi ke WhatsApp
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal QRIS */}
            <AnimatePresence>
                {showQRISModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                QR Code Pembayaran
                            </h3>

                            <div className="bg-gray-100 p-4 rounded-xl mb-4">
                                <img
                                    src="./qris.png"
                                    alt="QRIS Payment"
                                    className="w-full h-auto rounded-lg mx-auto"
                                />
                            </div>

                            <p className="text-gray-600 text-sm mb-4">
                                Scan QR code di atas untuk melakukan pembayaran
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowQRISModal(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => setShowQRISModal(false)}
                                    className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    Sudah Bayar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.6 }}
                className="relative z-10 bg-gradient-to-b from-orange-600 to-orange-800 text-white text-center py-8 mt-12"
            >
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-orange-200 font-medium text-lg mb-2">
                        &copy; 2025 OSIS 58 - Pendanaan
                    </p>
                </div>
            </motion.footer>
        </motion.div>
    );
}