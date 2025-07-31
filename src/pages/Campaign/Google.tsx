import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, setDoc, getFirestore, collection, getDocs, getDoc } from "firebase/firestore";
import ConfettiAnimation from "./confetti";
import { FiArrowLeft, FiArrowRight, FiPocket, FiCalendar, FiCheck, FiX } from "react-icons/fi";
import { normalizeIndianPhone } from "../../utils/NormalisePhone";

interface UserData {
    name: string;
    number: string;
    industry: string;
    customIndustry: string;
}

interface MetaProps {
    userData: UserData;
}

const basePrice = 5000;
const steps = ["Keyword", "Location", "Months"];

interface Transaction {
    txnid: string;
    amount: number;
    keywords: number;
    locations: number;
    duration: string;
    discount: number;
    timestamp: string;
    campaignType: string;
    status: string;
    userId?: string;
    userName?: string | null;
    userPhone?: string | null;
    userIndustry?: string;
}

const Meta: React.FC<MetaProps> = ({ userData }) => {
    const [step, setStep] = useState(0);
    const [keywords, setKeywords] = useState(1);
    const [locations, setLocations] = useState(1);
    const [selectedDuration, setSelectedDuration] = useState("1 Month");
    const [campaignLaunched, setCampaignLaunched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | null>(null);
    const [transactionData, setTransactionData] = useState<Transaction | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [previousCampaigns, setPreviousCampaigns] = useState<Transaction[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "create">("list");
    const [showDetails, setShowDetails] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const db = getFirestore();

    const durationOptions = [
        { label: "1 Month", months: 1, discount: 0 },
        { label: "3 Months", months: 3, discount: 33 },
        { label: "6 Months", months: 6, discount: 40 },
        { label: "12 Months", months: 12, discount: 50 }
    ];

    useEffect(() => {
        const fetchPreviousCampaigns = async () => {
            if (!userData?.number) return;

            const sanitizedPhone = userData.number.replace(/[^\d]/g, "");
            const transactionsRef = collection(db, `crm_users/${sanitizedPhone}/transactions`);

            const snapshot = await getDocs(transactionsRef);
            const campaigns = snapshot.docs.map((doc) => doc.data() as Transaction);

            setPreviousCampaigns(campaigns.filter((txn) => txn.campaignType === "Meta"));
        };

        fetchPreviousCampaigns();
    }, [userData, db]);

    useEffect(() => {
        const checkPaymentSuccess = async () => {
            const params = new URLSearchParams(window.location.search);
            const paymentSuccess = params.get('success');
            const txnid = params.get('txnid');

            if (paymentSuccess === 'true' && txnid && userData?.number) {
                try {
                    setLoading(true);
                    const sanitizedPhone = normalizeIndianPhone(userData.number);
                    const txnRef = doc(db, `crm_users/${sanitizedPhone}/transactions`, txnid);
                    
                    // Verify payment and update status
                    await setDoc(txnRef, {
                        status: "completed"
                    }, { merge: true });

                    // Get updated transaction data
                    const txnDoc = await getDoc(txnRef);
                    if (txnDoc.exists()) {
                        setTransactionData(txnDoc.data() as Transaction);
                        setPaymentStatus("success");
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 5000);
                        
                        // Clean URL
                        navigate(window.location.pathname, { replace: true });
                    }
                } catch (error) {
                    console.error("Error verifying payment:", error);
                    setPaymentStatus("error");
                    navigate(window.location.pathname, { replace: true });
                } finally {
                    setLoading(false);
                }
            }
        };

        checkPaymentSuccess();
    }, [userData, db, navigate]);

    const calculatePrice = useMemo(() => {
        const selectedDurationOption = durationOptions.find(opt => opt.label === selectedDuration);
        const months = selectedDurationOption?.months || 1;
        const discount = selectedDurationOption?.discount || 0;
        
        const baseTotal = basePrice * keywords * locations * months;
        const discountedPrice = baseTotal * (1 - discount / 100);
        
        return {
            basePrice: baseTotal,
            discountedPrice: discountedPrice,
            discount: discount,
            months: months
        };
    }, [keywords, locations, selectedDuration]);

    const { basePrice: calculatedBasePrice, discountedPrice, discount } = calculatePrice;

    const handlePayNow = async () => {
        const txnid = "TXN" + Date.now();
        const productinfo = "Ai Rank ";
        const firstname = userData.name || "Anonymous";
        const email = "";
        const phone = userData.number || "7715009983";

        // Success URL with parameters
        const surl = `https://asia-south1-starzapp.cloudfunctions.net/payu-server/payu/grlp/redirect`;
        const furl = `https://asia-south1-starzapp.cloudfunctions.net/payu-server/payu/webhook/failure`;

        try {
            setLoading(true);
            const sanitizedPhone = normalizeIndianPhone(userData.number);
            const transactionRef = doc(db, `crm_users/${sanitizedPhone}/transactions`, txnid);

            await setDoc(transactionRef, {
                txnid,
                amount: discountedPrice,
                keywords,
                locations,
                duration: selectedDuration,
                discount,
                timestamp: new Date().toISOString(),
                campaignType: "Google",
                status: "pending",
                userName: userData.name,
                userPhone: sanitizedPhone,
                userIndustry: userData.customIndustry || userData.industry
            });

            const res = await fetch(
                "https://asia-south1-starzapp.cloudfunctions.net/payu-server/payu/payment",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        txnid,
                        // amount: discountedPrice.toFixed(2),
                        amount: 1.00,
                        firstname,
                        email,
                        phone,
                        productinfo,
                        surl,
                        furl,
                        userPhone: userData.number,
                    }),
                }
            );

            const { paymentUrl, payload } = await res.json();

            const form = document.createElement("form");
            form.method = "POST";
            form.action = paymentUrl;

            for (const key in payload) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = payload[key];
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error("Payment Error:", error);
            setLoading(false);
            setPaymentStatus("error");
            
            const sanitizedPhone = normalizeIndianPhone(userData.number);
            const transactionRef = doc(db, `crm_users/${sanitizedPhone}/transactions`, txnid);
            await setDoc(transactionRef, {
                status: "failed"
            }, { merge: true });
        }
    };

    const nextStep = () =>
        setStep((prev) => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

    const launchCampaign = () => {
        setCampaignLaunched(true);
    };

    const startNewCampaign = () => {
        setViewMode("create");
        setCampaignLaunched(false);
        setStep(0);
    };

    const getCampaignProgress = (timestamp: string): number => {
        const now = Date.now();
        const start = new Date(timestamp).getTime();
        const elapsed = now - start;
        const total = 48 * 60 * 60 * 1000;
        return Math.min(Math.max(Math.floor((elapsed / total) * 100), 0), 100);
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <motion.div
                        key="keywords"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                                Select Number of Keywords
                            </h2>
                            <div className="text-3xl font-bold text-blue-600">
                                {keywords} {keywords === 1 ? "Keyword" : "Keywords"}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={keywords}
                                onChange={(val) => setKeywords(Array.isArray(val) ? val[0] : val)}
                                marks={{
                                    1: '1',
                                    2: '2',
                                    3: '3',
                                    4: '4',
                                    5: '5'
                                }}
                                trackStyle={{ backgroundColor: "#3b82f6", height: 10 }}
                                handleStyle={{
                                    borderColor: "#3b82f6",
                                    borderWidth: 3,
                                    height: 28,
                                    width: 28,
                                    backgroundColor: "white",
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                }}
                                railStyle={{ height: 10, backgroundColor: "#e5e7eb" }}
                                dotStyle={{ display: 'none' }}
                            />

                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>1 Keyword</span>
                                <span>5 Keywords</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-center text-gray-500 mt-2 text-sm">
                                More keywords help target a wider audience
                            </p>
                        </div>
                    </motion.div>
                );
            case 1:
                return (
                    <motion.div
                        key="locations"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                                Select Number of Locations
                            </h2>
                            <div className="text-3xl font-bold text-blue-600">
                                {locations} {locations === 1 ? "Location" : "Locations"}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={locations}
                                onChange={(val) => setLocations(Array.isArray(val) ? val[0] : val)}
                                marks={{
                                    1: '1',
                                    2: '2',
                                    3: '3',
                                    4: '4',
                                    5: '5'
                                }}
                                trackStyle={{ backgroundColor: "#3b82f6", height: 10 }}
                                handleStyle={{
                                    borderColor: "#3b82f6",
                                    borderWidth: 3,
                                    height: 28,
                                    width: 28,
                                    backgroundColor: "white",
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                }}
                                railStyle={{ height: 10, backgroundColor: "#e5e7eb" }}
                                dotStyle={{ display: 'none' }}
                            />

                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>1 Location</span>
                                <span>5 Locations</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-center text-gray-500 mt-2 text-sm">
                                More locations expand your reach geographically
                            </p>
                        </div>
                    </motion.div>
                );
            case 2:
                const selectedOption = durationOptions.find(opt => opt.label === selectedDuration);
                const totalPrice = basePrice * keywords * locations * (selectedOption?.months || 1);
                const discountedPrice = totalPrice * (1 - (selectedOption?.discount || 0) / 100);

                return (
                    <motion.div
                        key="duration"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                                <FiCalendar className="mr-2 text-blue-500" />
                                Select Duration
                            </h2>
                            
                            <div className="mb-8">
                                <Slider
                                    min={1}
                                    max={4}
                                    step={1}
                                    value={durationOptions.findIndex(opt => opt.label === selectedDuration) + 1}
                                    onChange={(val) => {
                                        const index = (Array.isArray(val) ? val[0] : val) - 1;
                                        setSelectedDuration(durationOptions[index].label);
                                    }}
                                    marks={{
                                        0: '5M',
                                        1: '1M',
                                        2: '3M',
                                        3: '6M',
                                        4: '12M'
                                    }}
                                    trackStyle={{ backgroundColor: "#3b82f6", height: 10 }}
                                    handleStyle={{
                                        borderColor: "#3b82f6",
                                        borderWidth: 3,
                                        height: 28,
                                        width: 28,
                                        backgroundColor: "white",
                                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                    }}
                                    railStyle={{ height: 10, backgroundColor: "#e5e7eb" }}
                                    dotStyle={{ display: 'none' }}
                                />
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-blue-800 font-medium">Selected Duration</p>
                                        <p className="font-bold text-blue-900">{selectedDuration}</p>
                                    </div>
                                    <div className="text-right">
                                        {selectedOption?.discount ? (
                                            <>
                                                <div className="line-through text-sm text-gray-500">
                                                    ₹{totalPrice.toLocaleString()}
                                                </div>
                                                <div className="text-xl font-bold text-blue-900">
                                                    ₹{discountedPrice.toLocaleString()}
                                                </div>
                                                <div className="text-green-600 text-sm font-medium">
                                                    {selectedOption.discount}% OFF
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xl font-bold text-blue-900">
                                                ₹{totalPrice.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const renderConfirmation = () => {
        const formatCurrency = (value: number) =>
            `₹${value.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;

        return (
            <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-blue-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">STARZ Ai Rank</h2>
                    <p className="text-gray-600 mt-2">
                        Review and confirm your Ranking details
                    </p>
                </div>

                <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-black text-sm font-medium">Keywords</p>
                            <p className="font-semibold text-gray-500">{keywords}</p>
                        </div>
                        <div>
                            <p className="text-black text-sm font-medium">Locations</p>
                            <p className="font-semibold text-gray-500">{locations}</p>
                        </div>
                        <div>
                            <p className="text-black text-sm font-medium">Duration</p>
                            <p className="font-semibold text-gray-500">{selectedDuration}</p>
                        </div>
                        <div>
                            <p className="text-black text-sm font-medium">Industry</p>
                            <p className="font-semibold text-gray-500">{userData.customIndustry || userData.industry}</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Breakup</h3>
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-medium text-black">{formatCurrency(calculatedBasePrice)}</span>
                    </div>

                    {showDetails && (
                        <>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Keywords ({keywords}):</span>
                                <span className="font-medium text-black">{formatCurrency(basePrice * keywords)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Locations ({locations}):</span>
                                <span className="font-medium text-black">{formatCurrency(basePrice * keywords * locations)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Duration ({selectedDuration}):</span>
                                <span className="font-medium text-black">{formatCurrency(calculatedBasePrice)}</span>
                            </div>
                        </>
                    )}

                    {discount > 0 && (
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Discount ({discount}%):</span>
                            <span className="font-medium text-green-600">
                                -{formatCurrency(calculatedBasePrice - discountedPrice)}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={() => setShowDetails((prev) => !prev)}
                        className="text-xs text-blue-600 hover:underline focus:outline-none"
                    >
                        {showDetails ? "Hide Breakdown" : "Show Full Breakdown"}
                    </button>

                    <div className="flex justify-between pt-2 font-semibold text-lg">
                        <span className="text-gray-800">Total Amount:</span>
                        <span className="text-blue-700">{formatCurrency(discountedPrice)}</span>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <motion.button
                        onClick={handlePayNow}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Pay Now
                    </motion.button>
                    <button
                        onClick={() => setCampaignLaunched(false)}
                        className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        Edit Campaign Details
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderCampaignList = () => (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        STARZ Ai Rank
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Your active Ranking Partner
                    </p>
                </div>
            </div>

            {previousCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {previousCampaigns.map((txn, idx) => {
                        const progress = getCampaignProgress(txn.timestamp);

                        return (
                            <motion.div
                                key={txn.txnid}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                            >
                                <div
                                    className={`p-5 border-b flex justify-between items-start ${txn.status === "completed"
                                        ? "bg-green-50 border-green-200"
                                        : "bg-yellow-50 border-yellow-200"
                                        }`}
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Campaign #{idx + 1}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {new Date(txn.timestamp).toLocaleDateString("en-IN", {
                                                dateStyle: "medium",
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${txn.status === "completed"
                                            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                                            : "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                                            }`}
                                    >
                                        {txn.status === "completed" ? "Active" : "Pending"}
                                    </span>
                                </div>

                                <div className="p-6 space-y-5">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">💰 Budget</p>
                                            <p className="font-semibold text-gray-800">
                                                ₹{txn.amount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">🔑 Keywords</p>
                                            <p className="font-semibold text-gray-800">{txn.keywords}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">📍 Locations</p>
                                            <p className="font-semibold text-gray-800">{txn.locations}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">⏳ Duration</p>
                                            <p className="font-semibold text-gray-800">
                                                {txn.duration}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500">Campaign Progress</span>
                                            <span className="font-medium text-gray-800">
                                                {progress}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2 rounded-full">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1 }}
                                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 block mt-1 text-right">
                                            {progress < 100 ? "Running" : "Completed"}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="inline-block bg-blue-100 p-5 rounded-full mb-4">
                        <FiPocket className="text-4xl text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        No Ranking Yet
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                        Start your Ranking to generate high-quality leads.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startNewCampaign}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Start Ranking
                    </motion.button>
                </div>
            )}
        </div>
    );

    const renderCampaignCreation = () => (
        <div className="max-w-2xl mx-auto p-6 space-y-10">
            <AnimatePresence mode="wait">
                {campaignLaunched ? (
                    renderConfirmation()
                ) : (
                    <>
                        <motion.div
                            key="timeline"
                            className="relative"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0"></div>
                            <div
                                className="absolute top-4 left-0 h-1 bg-blue-600 z-10 transition-all duration-500 ease-out"
                                style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                            ></div>

                            <div className="flex justify-between relative z-20">
                                {steps.map((label, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${index <= step
                                                ? "bg-blue-600 text-white shadow-lg"
                                                : "bg-gray-200 text-gray-500"
                                                }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <p
                                            className={`text-sm font-medium max-w-[120px] text-center px-1 ${index === step
                                                ? "text-blue-600 font-bold"
                                                : "text-gray-500"
                                                }`}
                                        >
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`step-${step}`}
                                initial={{ opacity: 0, x: step === 0 ? -50 : 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: step === 0 ? 50 : -50 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-lg p-6 md:p-8"
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={prevStep}
                                disabled={step === 0}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center font-medium transition-colors"
                            >
                                <FiArrowLeft className="mr-2" />
                                Back
                            </button>

                            {step < steps.length - 1 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors shadow-md"
                                >
                                    Continue
                                    <FiArrowRight className="ml-2" />
                                </button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={launchCampaign}
                                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg flex items-center font-bold transition-all"
                                >
                                    <FiPocket className="mr-2" />
                                    Review & Pay
                                </motion.button>
                            )}
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-10">
            <AnimatePresence>
                {paymentStatus && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    >
                        {showConfetti && <ConfettiAnimation />}

                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-xl p-8 max-w-md w-full relative"
                        >
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                    <p className="text-gray-700">
                                        Processing your transaction...
                                    </p>
                                </div>
                            ) : paymentStatus === "success" ? (
                                <>
                                    <div className="text-center">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [0, 10, -10, 0],
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="text-6xl mb-4 text-blue-500"
                                        >
                                            <FiCheck className="mx-auto" />
                                        </motion.div>

                                        <h2 className="text-2xl font-bold text-blue-600 mb-2">
                                            Payment Successful!
                                        </h2>
                                        <p className="text-gray-600 mb-6">
                                            Your AI Ranking campaign has been successfully launched.
                                        </p>

                                        <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                                            <p className="font-semibold mb-2 text-center">
                                                Transaction Details
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">ID:</span>
                                                    <span className="font-medium">
                                                        {transactionData?.txnid}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Amount:</span>
                                                    <span className="font-medium">
                                                        ₹{transactionData?.amount?.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Keywords:</span>
                                                    <span className="font-medium">
                                                        {transactionData?.keywords}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Locations:</span>
                                                    <span className="font-medium">
                                                        {transactionData?.locations}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Duration:</span>
                                                    <span className="font-medium">
                                                        {transactionData?.duration}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setPaymentStatus(null);
                                                setViewMode("list");
                                            }}
                                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:brightness-110 transition-all"
                                        >
                                            View Campaigns
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <div className="text-6xl mb-4 text-red-500">
                                            <FiX className="mx-auto" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-red-600 mb-2">
                                            Payment Failed
                                        </h2>
                                        <p className="text-gray-600 mb-6">
                                            Please try again or contact support
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setPaymentStatus(null)}
                                                className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handlePayNow}
                                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {viewMode === "list" ? renderCampaignList() : renderCampaignCreation()}
        </div>
    );
};

export default Meta;