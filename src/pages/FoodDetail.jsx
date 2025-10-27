import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function FoodDetail() {
    const { id } = useParams();
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderData, setOrderData] = useState({
        nama: '',
        kelas: '',
        nomor_telpon: '',
        notes: '',
        jumlah_pesanan: 1
    });

    useEffect(() => {
        const url =
            "https://docs.google.com/spreadsheets/d/1Iza2Ys74RNG_x5WjHW8QcqxXlhD0ldqwuxHFra05jIY/gviz/tq?tqx=out:json";

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

                const selected = rows.find(item => String(item.id) === String(id));
                setFood(selected);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching detail:", err);
                setLoading(false);
            });
    }, [id]);

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

    const calculateTotal = () => {
        if (!food) return 0;
        const price = extractPrice(food.price);
        return price * orderData.jumlah_pesanan;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!orderData.nama.trim() || !orderData.kelas.trim() || !orderData.nomor_telpon.trim()) {
            alert('Silakan lengkapi semua data!');
            setSubmitting(false);
            return;
        }

        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!phoneRegex.test(orderData.nomor_telpon)) {
            alert('Format nomor telepon tidak valid!');
            setSubmitting(false);
            return;
        }

        const totalHarga = calculateTotal();

        const url = "https://script.google.com/macros/s/AKfycbzU6f5sawaOMOQifg4A1zddT1UaoDeDRBABIlXHWpb2Lbp8uOe7Bbwb-OqCP9IRf9gL/exec";

        const bodyData = `timestamp=${encodeURIComponent(new Date().toLocaleString('id-ID'))}&nama=${encodeURIComponent(orderData.nama)}&kelas=${encodeURIComponent(orderData.kelas)}&nomor_telpon=${encodeURIComponent(orderData.nomor_telpon)}&makanan=${encodeURIComponent(food.name)}&jumlah_pesanan=${orderData.jumlah_pesanan}&total_harga=${totalHarga}&notes=${orderData.notes}`;

        console.log("Mengirim data ke Google Sheets:", bodyData);

        try {
            const sheetResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: bodyData
            });

            const result = await sheetResponse.text();
            console.log("Response dari Google Sheets:", result);

            setShowSuccessModal(true);

            setTimeout(() => {
                setOrderData({
                    nama: '',
                    kelas: '',
                    nomor_telpon: '',
                    notes: '',
                    jumlah_pesanan: 1
                });
                setSubmitting(false);
            }, 2000);

        } catch (error) {
            console.error("Error dalam handleSubmitOrder:", error);

            openWhatsApp();
            setSubmitting(false);
        }
    };

    const openWhatsApp = () => {
        const totalHarga = calculateTotal();
        const description = food.description && food.description !== "null"
            ? food.description
            : " ";
        const notesText = orderData.notes && orderData.notes.trim() !== "" ? orderData.notes : "-";
        const message = `Halo! Saya mau pesan:\n\n*${food.name}*\n• Jumlah: ${orderData.jumlah_pesanan} pcs\n• Total: Rp ${formatPrice(totalHarga)},-\n${description}\n• Notes/Request: ${notesText}\n\n• *Pemesan:*\nNama: ${orderData.nama}\nKelas: ${orderData.kelas}\nTelpon: ${orderData.nomor_telpon}\n\n_*[ORDER DANTEN]*_`;

        const whatsappUrl = `https://wa.me/6283856278811?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    const handleInputChange = (field, value) => {
        setOrderData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const totalHarga = calculateTotal();

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center"
            >
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-orange-700 text-lg font-semibold">Memuat detail menu...</p>
                </div>
            </motion.div>
        );
    }

    if (!food) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-orange-700 text-lg mb-4">Menu tidak ditemukan</p>
                    <Link to="/" className="text-orange-600 underline hover:text-orange-700 font-semibold">
                        Kembali ke menu utama
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100"
        >
            <div
                className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
                style={{ backgroundImage: "url('../Bg.png')" }}
            ></div>

            <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-orange-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <Link to="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition-colors">
                        ← Kembali ke Menu Utama
                    </Link>
                </div>
            </header>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100"
                >
                    <div className="relative h-80 sm:h-105 bg-gray-100 overflow-hidden">
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                            src={food.image_url}
                            alt={food.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    <div className="p-6 border-b border-orange-100">
                        <div className="flex justify-between items-start mb-2">
                            <motion.h2
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold text-gray-800"
                            >
                                {food.name}
                            </motion.h2>
                            <motion.span
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl"
                            >
                                {food.price}
                            </motion.span>
                        </div>

                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-gray-600 leading-relaxed"
                        >
                            {food.description && food.description !== "null"
                                ? food.description
                                : "Menu DanTen yang memiliki bahan-bahan fresh dan berkualitas!"}
                        </motion.p>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmitOrder} className="space-y-6">
                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-2xl font-bold text-gray-800 border-b border-orange-200 pb-3"
                            >
                                Pemesanan
                            </motion.h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        value={orderData.nama}
                                        onChange={(e) => handleInputChange('nama', e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                        required
                                        disabled={submitting}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Kelas *
                                    </label>
                                    <input
                                        type="text"
                                        value={orderData.kelas}
                                        onChange={(e) => handleInputChange('kelas', e.target.value)}
                                        placeholder="Contoh: XI RPL"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                        required
                                        disabled={submitting}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.0 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Nomor Telepon *
                                    </label>
                                    <input
                                        type="tel"
                                        value={orderData.nomor_telpon}
                                        onChange={(e) => handleInputChange('nomor_telpon', e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                        required
                                        disabled={submitting}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.0 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Jumlah Pesanan *
                                    </label>
                                    <input
                                        type="text"
                                        value={orderData.jumlah_pesanan}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                            setOrderData(prev => ({
                                                ...prev,
                                                jumlah_pesanan: value === "" ? "" : parseInt(value)
                                            }));
                                        }}
                                        placeholder="Masukkan jumlah pesanan"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        required
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.0 }}
                                >
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Notes/Catatan *
                                    </label>
                                    <input
                                        type="text"
                                        value={orderData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Untuk memilih jenis varian makanan (jika ada)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                        required
                                        disabled={submitting}
                                    />
                                </motion.div>

                            </div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200"
                            >
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span className="text-gray-800">Total Harga:</span>
                                    <span className="text-orange-600 text-2xl">
                                        Rp {formatPrice(totalHarga)},-
                                    </span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.3 }}
                            >
                                <button
                                    type="submit"
                                    disabled={!orderData.nama.trim() || !orderData.kelas.trim() || !orderData.nomor_telpon.trim() || submitting}
                                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center ${orderData.nama.trim() && orderData.kelas.trim() && orderData.nomor_telpon.trim() && !submitting
                                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                        : 'bg-orange-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                                            />
                                            Memproses Pesanan...
                                        </>
                                    ) : (
                                        'Pesan Sekarang!'
                                    )}
                                </button>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </main>

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
                                    openWhatsApp();
                                }}
                                className="bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                            >
                                Konfirmasi ke WhatsApp
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
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