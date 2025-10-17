import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function FoodDetail() {
    const { id } = useParams();
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState({
        nama: '',
        kelas: '',
        nomor_telpon: '',
        jumlah_pesanan: 1
    });

    useEffect(() => {
        fetch("https://lawaggg.github.io/DanTenAPI/api/foods.json")
            .then((response) => response.json())
            .then((data) => {
                const selectedFood = data.find(item => item.id === id);
                setFood(selectedFood);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, [id]);

    // Function untuk extract harga dari string price
    const extractPrice = (priceString) => {
        const priceMatch = priceString.match(/Rp\s*([0-9.,]+)/);
        if (priceMatch) {
            const price = priceMatch[1].replace(/\./g, '');
            return parseInt(price) || 0;
        }
        return 0;
    };

    // Function untuk format price menjadi angka
    const formatPrice = (priceString) => {
        const price = extractPrice(priceString);
        return new Intl.NumberFormat('id-ID').format(price);
    };

    // Function untuk menghitung total harga
    const calculateTotal = () => {
        if (!food) return 0;
        const price = extractPrice(food.price);
        return price * orderData.jumlah_pesanan;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (!orderData.nama.trim() || !orderData.kelas.trim() || !orderData.nomor_telpon.trim()) {
            alert('Silakan lengkapi semua data!');
            return;
        }

        // Validasi nomor telepon
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!phoneRegex.test(orderData.nomor_telpon)) {
            alert('Format nomor telepon tidak valid!');
            return;
        }

        const totalHarga = calculateTotal();

        // Format data untuk dikirim ke Google Sheets - SAMA PERSIS seperti contoh
        const url = "https://script.google.com/macros/s/AKfycbzU6f5sawaOMOQifg4A1zddT1UaoDeDRBABIlXHWpb2Lbp8uOe7Bbwb-OqCP9IRf9gL/exec";
        
        const bodyData = `timestamp=${encodeURIComponent(new Date().toLocaleString('id-ID'))}&nama=${encodeURIComponent(orderData.nama)}&kelas=${encodeURIComponent(orderData.kelas)}&nomor_telpon=${encodeURIComponent(orderData.nomor_telpon)}&makanan=${encodeURIComponent(food.name)}&jumlah_pesanan=${orderData.jumlah_pesanan}&total_harga=${totalHarga}`;

        console.log("Mengirim data ke Google Sheets:", bodyData);

        try {
            // Kirim ke Google Sheets - SAMA PERSIS seperti contoh
            const sheetResponse = await fetch(url, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded" 
                },
                body: bodyData
            });

            const result = await sheetResponse.text();
            console.log("Response dari Google Sheets:", result);

            // BUKA WhatsApp setelah mengirim data
            const description = food.description && food.description !== "null"
                ? food.description
                : "Menu spesial dari DanTen";

            const message = `Halo! Saya mau pesan:\n\n🍱 *${food.name}*\n💰 Harga: ${food.price}\n🔢 Jumlah: ${orderData.jumlah_pesanan} pcs\n💵 Total: Rp ${formatPrice(totalHarga.toString())},-\n📝 ${description}\n\n👤 *Data Pemesan:*\nNama: ${orderData.nama}\nKelas: ${orderData.kelas}\nTelpon: ${orderData.nomor_telpon}\n\n_*[ORDER DANUSAN OSIS]*_`;

            const whatsappUrl = `https://wa.me/6283856278811?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");

            // Reset form
            setOrderData({
                nama: '',
                kelas: '',
                nomor_telpon: '',
                jumlah_pesanan: 1
            });

            alert('Pesanan berhasil dikirim ke WhatsApp! Data sudah tersimpan.');

        } catch (error) {
            console.error("Error dalam handleSubmitOrder:", error);
            
            // Tetap buka WhatsApp meskipun Google Sheets error
            const description = food.description && food.description !== "null"
                ? food.description
                : "Menu spesial dari DanTen";

            const message = `Halo! Saya mau pesan:\n\n🍱 *${food.name}*\n💰 Harga: ${food.price}\n🔢 Jumlah: ${orderData.jumlah_pesanan} pcs\n💵 Total: Rp ${formatPrice(totalHarga.toString())},-\n📝 ${description}\n\n👤 *Data Pemesan:*\nNama: ${orderData.nama}\nKelas: ${orderData.kelas}\nTelpon: ${orderData.nomor_telpon}\n\n_*[ORDER DANUSAN OSIS]*_`;

            const whatsappUrl = `https://wa.me/6283856278811?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");

            // Reset form
            setOrderData({
                nama: '',
                kelas: '',
                nomor_telpon: '',
                jumlah_pesanan: 1
            });

            alert('Pesanan berhasil dikirim ke WhatsApp!');
        }
    };

    const handleInputChange = (field, value) => {
        setOrderData(prev => ({
            ...prev,
            [field]: value
        }));
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
                    <p className="text-orange-700">Memuat detail menu...</p>
                </div>
            </motion.div>
        );
    }

    if (!food) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-orange-700 text-lg">Menu tidak ditemukan</p>
                    <Link to="/" className="text-orange-600 underline mt-4 inline-block">
                        Kembali ke menu utama
                    </Link>
                </div>
            </div>
        );
    }

    const totalHarga = calculateTotal();

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

            {/* Header */}
            <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-orange-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <Link to="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold">
                        ← Kembali ke Menu Utama
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                    {/* Food Image */}
                    <div className="h-80 sm:h-96 bg-gray-100">
                        <img
                            src={food.image_url}
                            alt={food.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Food Info */}
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-3xl font-bold text-gray-800">{food.name}</h1>
                            <span className="text-2xl font-bold text-orange-600">{food.price}</span>
                        </div>

                        {food.category && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {food.category.map((cat, index) => (
                                    <span
                                        key={index}
                                        className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        )}

                        <p className="text-gray-600 text-lg">
                            {food.description && food.description !== "null"
                                ? food.description
                                : "Menu spesial DanTen yang dibuat dengan bahan-bahan fresh dan berkualitas."}
                        </p>
                    </div>

                    {/* Order Form */}
                    <div className="p-6">
                        <form onSubmit={handleSubmitOrder} className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Form Pemesanan</h2>

                            {/* Nama */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    value={orderData.nama}
                                    onChange={(e) => handleInputChange('nama', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            {/* Kelas */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Kelas *
                                </label>
                                <input
                                    type="text"
                                    value={orderData.kelas}
                                    onChange={(e) => handleInputChange('kelas', e.target.value)}
                                    placeholder="Contoh: X RPL 1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            {/* Nomor Telepon */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Nomor Telepon *
                                </label>
                                <input
                                    type="tel"
                                    value={orderData.nomor_telpon}
                                    onChange={(e) => handleInputChange('nomor_telpon', e.target.value)}
                                    placeholder="Contoh: 081234567890"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Jumlah Pesanan *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={orderData.jumlah_pesanan}
                                    onChange={(e) => handleInputChange('jumlah_pesanan', parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            {/* Total Harga */}
                            <div className="bg-orange-50 p-4 rounded-xl">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span className="text-gray-700">Total Harga:</span>
                                    <span className="text-orange-600 text-xl">
                                        Rp {formatPrice(totalHarga.toString())},-
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {orderData.jumlah_pesanan} pcs × {food.price}
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!orderData.nama.trim() || !orderData.kelas.trim() || !orderData.nomor_telpon.trim()}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${orderData.nama.trim() && orderData.kelas.trim() && orderData.nomor_telpon.trim()
                                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                                        : 'bg-orange-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                📱 Pesan Sekarang & Kirim ke WhatsApp
                            </button>

                            <p className="text-sm text-gray-500 text-center">
                                Data akan otomatis tersimpan di sistem kami
                            </p>
                        </form>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 bg-orange-900 text-white text-center py-8 mt-12">
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-orange-200 text-lg">
                        &copy; 2025 OSIS 58 - Pendanaan
                    </p>
                </div>
            </footer>
        </motion.div>
    );
}