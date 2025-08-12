import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, onSnapshot, query, where, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously, signOut, signInWithCustomToken } from 'firebase/auth';

// --- Helper Functions & Configuration ---

// PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyD38JKcmqITmGUXN-9j9VRkIxRsdyGP3fs",
  authDomain: "pawcare-984fd.firebaseapp.com",
  projectId: "pawcare-984fd",
  storageBucket: "pawcare-984fd.firebasestorage.app",
  messagingSenderId: "921796152720",
  appId: "1:921796152720:web:27161a12d63a03d134b715",
  measurementId: "G-6ZP58JYZM2"
};

// Initialize Firebase
let app;
let db;
let auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase initialization error:", e);
}


// --- Custom Hook for Scroll Animation ---
const useScrollFadeIn = () => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref]);

    return [ref, isVisible];
};

// --- FadeIn Wrapper Component ---
const FadeIn = ({ children }) => {
    const [ref, isVisible] = useScrollFadeIn();
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            {children}
        </div>
    );
};

// --- Peeking Button Component ---
const PeekingButton = ({ children, className, ...props }) => {
    return (
        <button {...props} className={`relative group overflow-hidden ${className}`}>
            <span className="relative z-10">{children}</span>
            <div className="absolute top-0 -left-12 h-full w-10 transition-all duration-500 ease-out group-hover:left-0">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                    <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#E0A96D"/>
                    <path d="M8.42859 12.5714C-1.90475 22.0952 4.42859 35.7143 8.42859 30L15.1429 20L8.42859 12.5714Z" fill="#BF8A58"/>
                    <path d="M31.5714 12.5714C41.9048 22.0952 35.5714 35.7143 31.5714 30L24.8571 20L31.5714 12.5714Z" fill="#BF8A58"/>
                    <path d="M20 22.8571C14.8571 22.8571 12.2857 32 20 32C27.7143 32 25.1429 22.8571 20 22.8571Z" fill="white"/>
                    <ellipse cx="20" cy="25.1429" rx="2.85714" ry="1.71429" fill="black"/>
                    <circle cx="15.1429" cy="18.2857" r="2.28571" fill="black"/>
                    <circle cx="24.8571" cy="18.2857" r="2.28571" fill="black"/>
                </svg>
            </div>
        </button>
    );
};


// --- Icon Components ---
// PERMANENT LOGO - DO NOT CHANGE
const LogoIcon = ({ className = "h-18 w-20" }) => (
    <img src="https://i.postimg.cc/85K1SxTH/PAWCARE-LOGO-removebg-preview-1.png" alt="PawCare Logo" className={className} />
);
const LocationMarkerIcon = ({ className = "w-5 h-5" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>);
const RupeeIcon = ({ className = "w-5 h-5" }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 4h4m-5 4h4M5 12h.01M5 8h.01M5 16h.01M3 4h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z"></path></svg>);
const StarIcon = ({ className = "w-5 h-5", isFilled = true }) => ( <svg className={className} fill={isFilled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>);
const HeartIcon = ({ className = "w-6 h-6", isFilled = false }) => ( <svg className={className} fill={isFilled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>);
const PlayIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>);
const WhatsAppIcon = ({ className = "w-8 h-8" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.687-1.475L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.447-4.435-9.884-9.888-9.884-5.448 0-9.886 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004l-1.27 4.625l4.752-1.249z" /></svg>);
const ShieldCheckIcon = ({ className = "w-6 h-6" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 2.944c4.492 0 8.29-2.655 9.932-6.344a12.042 12.042 0 00-3.314-10.968z"></path></svg>);
const ChatIcon = ({ className = "w-8 h-8" }) => (<svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>);
const CartIcon = ({ className = "w-6 h-6" }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>);

// --- Sample Data (with updated, breed-specific image galleries) ---
const sampleDogs = [
    { name: 'Shep', breed: 'German Shepherd', price: 7500, location: 'Delhi', age: 2, gender: 'Male', health: 'Vaccinated', temperament: 'Highly trainable, intelligent, protective', rating: 5, status: 'In Training', gallery: ['https://cdn.britannica.com/79/232779-050-6B0411D7/German-Shepherd-dog-Alsatian.jpg', 'https://cdn.mos.cms.futurecdn.net/Tdom4TwTjsVFLhXrNqnZHS.jpg', 'https://www.akc.org/wp-content/uploads/2017/11/German-Shepherd-on-White-00.jpg'], videoUrl: 'https://www.youtube.com/embed/f4Z-Dl-c_Zs', maintenance: 'high', activity: 'high', trainingProgress: 40, vetChecks: ['Basic obedience training started'] },
    { name: 'Kairo', breed: 'Belgian Malinois', price: 8200, location: 'Mumbai', age: 2, gender: 'Male', health: 'Vaccinated', temperament: 'Very obedient, lighter, faster', rating: 5, status: 'Ready', gallery: ['https://pet-health-content-media.chewy.com/wp-content/uploads/2024/09/11180651/202105iStock-1395878741.jpg', 'https://cdn.britannica.com/85/232785-050-0EE871BE/Belgian-Malinois-dog.jpg', 'https://www.protectiondog.com/cdn/shop/products/ron-rudy-and-raven-269533_1400x.jpg?v=1670013908'], videoUrl: 'https://www.youtube.com/embed/Bg41LajvptE', maintenance: 'medium', activity: 'high', trainingProgress: 85, vetChecks: ['All shots up to date'] },
    { name: 'Rocky', breed: 'Doberman Pinscher', price: 8000, location: 'Bangalore', age: 2, gender: 'Male', health: 'Fully Vaccinated & Dewormed', temperament: 'Loyal, fearless, protective', rating: 5, status: 'Ready', gallery: ['https://images.happypet.care/images/21217/doberman-pinscher-standing-by-water.webp', 'https://www.trupanion.com/images/trupanionwebsitelibraries/default-album/doberman-pinschers-black.jpg?sfvrsn=d0bf90a2_4', 'https://images.ctfassets.net/nx3pzsky0bc9/5JNIP0KkbMkF8sjyeVFcvt/d2db4e388b752e69935a6001b0259efa/Doberman_feature_image.png?w=804'], videoUrl: 'https://www.youtube.com/embed/vuhhdtoLScg', maintenance: 'medium', activity: 'high', trainingProgress: 90, vetChecks: ['Initial checkup: Healthy', 'First vaccination complete'] },
    { name: 'Bruno', breed: 'Rottweiler', price: 7900, location: 'Pune', age: 3, gender: 'Male', health: 'Vaccinated', temperament: 'Strong, protective, confident', rating: 5, status: 'Ready', gallery: ['https://www.agriapet.co.uk/.netlify/images?w=750&h=372&fit=cover&position=center&fm=jpg&q=75&url=https%3A%2F%2Fagria.uksouth01.umbraco.io%2Fmedia%2Fzkopis2j%2Frottweiler.jpeg%3Fwidth%3D1335%26quality%3D80&cd=df1fa7170e0c6f01a1d430141710da87', 'https://www.europuppy.com/wp-content/uploads/2024/07/sire_47546_6.jpg', 'https://media.istockphoto.com/id/1064340804/photo/rottweiler.jpg?s=612x612&w=0&k=20&c=l-OPxfIEYxZElQTNS6yDdVOXAOhXqlG03jxj_Gc8PSE='], videoUrl: 'https://www.youtube.com/embed/lW_UIaYI7bk', maintenance: 'low', activity: 'medium', trainingProgress: 75, vetChecks: ['Annual checkup complete'] },
    { name: 'Champ', breed: 'Boxer', price: 6500, location: 'Kolkata', age: 2, gender: 'Male', health: 'Vet Checked', temperament: 'Energetic, alert, loyal', rating: 4, status: 'Ready', gallery: ['https://cdn.britannica.com/46/233846-050-8D30A43B/Boxer-dog.jpg', 'https://pet-health-content-media.chewy.com/wp-content/uploads/2024/09/11181200/202104iStock-1257560195-scaled-1.jpg', 'https://www.thesprucepets.com/thmb/YwjpUBfdG8mkz2L64CX4-mA8cko=/1539x0/filters:no_upscale():strip_icc()/boxer-dog-breed-1117944-hero-dfe9f67a59ce4ab19ebd274c06b28ad1.jpg'], videoUrl: 'https://www.youtube.com/embed/BRnDshdmhsw', maintenance: 'medium', activity: 'high', trainingProgress: 50, vetChecks: ['Vet check complete'] },
    { name: 'Duke', breed: 'Bullmastiff', price: 7800, location: 'Hyderabad', age: 4, gender: 'Male', health: 'Vaccinated', temperament: 'Powerful, calm, protective', rating: 5, status: 'Ready', gallery: ['https://www.akc.org/wp-content/uploads/2017/11/Bullmastiff-standing-in-a-field.jpg', 'https://media.dog-learn.com/images/bullmastiff-lld-sz6.jpg', 'https://www.prodograw.com/wp-content/uploads/2023/04/bullmastiff.jpg'], videoUrl: 'https://www.youtube.com/embed/_LQaqo45xYY', maintenance: 'low', activity: 'medium', trainingProgress: 65, vetChecks: ['All shots up to date'] },
    { name: 'Veera', breed: 'Kombai', price: 5000, location: 'Chennai', age: 2, gender: 'Female', health: 'Vaccinated', temperament: 'Adapted to Indian climate', rating: 4, status: 'Ready', gallery: ['https://upload.wikimedia.org/wikipedia/commons/c/c0/Combai_Dog.jpg', 'https://www.dogpackapp.com/blog/wp-content/uploads/2024/12/kombai-dog-close-up.webp', 'https://i.pinimg.com/736x/e8/4d/58/e84d_5822685df6de7a5a2c322b7ed1ed.jpg'], videoUrl: 'https://www.youtube.com/embed/NJBTUSHVXbs', maintenance: 'low', activity: 'medium', trainingProgress: 30, vetChecks: ['Initial vet check complete'] },
    { name: 'Goldie', breed: 'Golden Retriever', price: 7200, location: 'Mumbai', age: 2, gender: 'Female', health: 'Vaccinated', temperament: 'Very loving, intuitive, friendly', rating: 5, status: 'Ready', gallery: ['https://heronscrossing.vet/wp-content/uploads/Golden-Retriever.jpg', 'https://petsworld.in/cdn/shop/articles/golden-retriever_7d05df63-fecf-4246-9c76-abd9da09ede3.jpg?v=1730809408', 'https://image.petmd.com/files/inline-images/golden-retriever-2.jpg?VersionId=9HAclc1bWh8XvyNoGi2.UxpdEp1gygb_'], videoUrl: 'https://www.youtube.com/embed/Trs0pB_I_2Y', maintenance: 'medium', activity: 'high', trainingProgress: 60, vetChecks: ['All shots up to date'] },
    { name: 'Coco', breed: 'Poodle (Standard)', price: 6800, location: 'Hyderabad', age: 1, gender: 'Female', health: 'Vet Checked', temperament: 'Hypoallergenic, intelligent', rating: 4, status: 'Ready', gallery: ['https://image.petmd.com/files/inline-images/standard-poodle.jpg?VersionId=1Pjx5emdAPxmImIlwCR0tX3HXxxm_NhT', 'https://www.dailypaws.com/thmb/n4T9EL8tgIWYEmKgZJsUHad5ioA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/standard-poodle-rhinestone-collar-1219549602-82b10725f9cb49beb412e8df29fdb744.jpg', 'https://cdn.britannica.com/92/212692-050-D53981F5/labradoodle-dog-stick-running-grass.jpg'], videoUrl: 'https://www.youtube.com/embed/cUcu2ipUMxM', maintenance: 'high', activity: 'medium', trainingProgress: 70, vetChecks: ['Vet check complete'] },
    { name: 'Lady', breed: 'Cocker Spaniel', price: 5800, location: 'Jaipur', age: 1, gender: 'Female', health: 'Vaccinated', temperament: 'Loving, gentle, playful', rating: 4, status: 'Ready', gallery: ['https://www.zooplus.co.uk/magazine/wp-content/uploads/2019/03/english-cocker-spaniel-UK.webp', 'https://www.lassie.co/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fr208a72kad0m%2F4WzmMoWDU2Evi6djb138Gj%2Fa6c3d349ddc7d4dccf9d344687dc7613%2Finge-marije-de-boer-YkHBmN_d9Q8-unsplash.jpg&w=3840&q=75', 'https://www.rover.com/blog/wp-content/uploads/cocker-spaniel-breed-standing-in-field.jpg'], videoUrl: 'https://www.youtube.com/embed/WtCojKGFHWk', maintenance: 'high', activity: 'medium', trainingProgress: 45, vetChecks: ['First vaccination complete'] },
];

// --- Custom Modal for Alerts ---
function CustomAlert({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm text-center">
                <p className="text-lg text-gray-800 mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-[#8B4513] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#63372C] transition-colors"
                >
                    OK
                </button>
            </div>
        </div>
    );
}

// --- Main Application Component ---
export default function App() {
    const [page, setPage] = useState('home');
    const [dogs, setDogs] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [productOrders, setProductOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageData, setPageData] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const showAlert = (message) => {
        setAlertMessage(message);
    };

    useEffect(() => {
        if (!auth) {
            setIsAuthReady(true);
            setIsLoading(false);
            console.error("Firebase Auth is not initialized.");
            showAlert("Could not connect to the database. Some features might not work.");
            return;
        }

        const initAuth = async () => {
            try {
                // For a standard web deployment, we will just sign in anonymously.
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Authentication Error:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);
        });

        initAuth();
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthReady) return;
        if (!user) {
            setDogs([]);
            setInquiries([]);
            setFavorites([]);
            setPurchases([]);
            setProductOrders([]);
            setIsLoading(false);
            return;
        }
        
        const userId = user.uid;
        const appId = firebaseConfig.appId; // Use appId from your config
        setIsLoading(true);
        
        const dogsCollectionPath = `artifacts/${appId}/users/${userId}/dogs`;
        const inquiriesCollectionPath = `artifacts/${appId}/users/${userId}/inquiries`;
        const favoritesCollectionPath = `artifacts/${appId}/users/${userId}/favorites`;
        const purchasesCollectionPath = `artifacts/${appId}/users/${userId}/purchases`;
        const reviewsCollectionPath = `artifacts/${appId}/public/data/reviews`;
        const productOrdersCollectionPath = `artifacts/${appId}/public/data/productOrders`;

        const unsubscribes = [
            onSnapshot(collection(db, dogsCollectionPath), (snapshot) => { setDogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setIsLoading(false); }, (error) => { console.error("Error fetching dogs:", error); setIsLoading(false); }),
            onSnapshot(collection(db, inquiriesCollectionPath), (snapshot) => setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), (error) => console.error("Error fetching inquiries:", error)),
            onSnapshot(collection(db, favoritesCollectionPath), (snapshot) => setFavorites(snapshot.docs.map(doc => doc.id)), (error) => console.error("Error fetching favorites:", error)),
            onSnapshot(collection(db, purchasesCollectionPath), (snapshot) => setPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), (error) => console.error("Error fetching purchases:", error)),
            onSnapshot(collection(db, reviewsCollectionPath), (snapshot) => setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), (error) => console.error("Error fetching reviews:", error)),
            onSnapshot(collection(db, productOrdersCollectionPath), (snapshot) => setProductOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), (error) => console.error("Error fetching product orders:", error))
        ];

        return () => unsubscribes.forEach(unsub => unsub());
    }, [isAuthReady, user]);

    const handleProductPurchase = async (product) => {
        if (!user || !db) {
            showAlert("You must be logged in to purchase products.");
            return;
        }
        
        const order = {
            userId: user.uid,
            items: [product],
            total: parseFloat(product.price.replace(/[^0-9.-]+/g,"")),
            orderDate: new Date()
        };

        const appId = firebaseConfig.appId; // Use appId from your config
        const productOrdersCollectionPath = `artifacts/${appId}/public/data/productOrders`;
        try {
            await addDoc(collection(db, productOrdersCollectionPath), order);
            showAlert(`${product.name} purchased successfully!`);
        } catch (error) {
            console.error("Error purchasing product:", error);
            showAlert("There was a problem with your purchase.");
        }
    };

    const navigateTo = (pageName, data = null) => {
        setPageData(data);
        setPage(pageName);
        window.scrollTo(0, 0);
    };

    const renderPage = () => {
        const favoritedDogs = dogs.filter(dog => favorites.includes(dog.id));
        const purchasedDogs = purchases.map(p => {
            const dogDetails = dogs.find(d => d.id === p.dogId);
            return { ...p, ...dogDetails, id: p.id };
        });
        const featuredReviews = reviews.filter(r => r.isFeatured);
        const userProductOrders = productOrders.filter(order => order.userId === user?.uid);

        switch (page) {
            case 'home':
                return <HomePage navigateTo={navigateTo} dogs={dogs} isLoading={isLoading} featuredReviews={featuredReviews} />;
            case 'dogProfile':
                return <DogProfilePage dog={pageData} navigateTo={navigateTo} userId={user?.uid} favorites={favorites} showAlert={showAlert} />;
            case 'matchmaking':
                return <MatchmakingPage dogs={dogs} navigateTo={navigateTo} />;
            case 'admin':
                return <AdminPage dogs={dogs} inquiries={inquiries} reviews={reviews} productOrders={productOrders} userId={user?.uid} showAlert={showAlert} />;
            case 'dashboard':
                return <ClientDashboard userId={user?.uid} favoritedDogs={favoritedDogs} purchasedDogs={purchasedDogs} productOrders={userProductOrders} navigateTo={navigateTo} showAlert={showAlert} />;
            case 'checkout':
                return <CheckoutPage checkoutInfo={pageData} navigateTo={navigateTo} userId={user?.uid} />;
            case 'orderSuccess':
                return <OrderSuccessPage dog={pageData} navigateTo={navigateTo} />;
            case 'services':
                return <ServicesPage navigateTo={navigateTo} userId={user?.uid} showAlert={showAlert} onPurchase={handleProductPurchase} />;
            case 'ourProcess':
                return <OurProcessPage navigateTo={navigateTo} />;
            default:
                return <HomePage navigateTo={navigateTo} dogs={dogs} isLoading={isLoading} featuredReviews={featuredReviews} />;
        }
    };

    return (
        <div className="bg-[#FFFBF5] min-h-screen font-sans">
            <CustomAlert message={alertMessage} onClose={() => setAlertMessage('')} />
            <Header navigateTo={navigateTo} currentPage={page} />
            <main className="pt-20 md:pt-24">
                {isAuthReady ? renderPage() : <div className="text-center p-12">Loading...</div>}
            </main>
            <Footer />
            <WhatsAppButton />
            <Chatbot />
        </div>
    );
}

// --- Page & Layout Components ---

function Header({ navigateTo, currentPage }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsHeaderVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleNavigate = (page) => {
        navigateTo(page);
        setIsMenuOpen(false);
    }
    
    const linkClasses = (pageName) => {
        const baseClasses = "px-4 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out cursor-pointer";
        const activeClasses = "bg-[#8B4513] text-white shadow-inner";
        const inactiveClasses = "text-[#63372C] hover:bg-amber-100 hover:text-[#8B4513]";
        
        return `${baseClasses} ${currentPage === pageName ? activeClasses : inactiveClasses}`;
    };
    
    const mobileLinkClasses = (pageName) => {
        const baseClasses = "block px-3 py-2 rounded-md text-base font-medium";
        const activeClasses = "bg-[#8B4513] text-white";
        const inactiveClasses = "text-[#63372C] hover:text-[#8B4513] hover:bg-amber-50";
        
        return `${baseClasses} ${currentPage === pageName ? activeClasses : inactiveClasses}`;
    }


    return (
        <header className={`bg-[#FDF6E9] shadow-sm fixed w-full top-0 z-50 transition-all duration-1000 ease-out ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-20 md:h-24">
                    <div className="flex items-center cursor-pointer" onClick={() => handleNavigate('home')}>
                        <LogoIcon />
                    </div>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-2">
                        <a onClick={() => handleNavigate('home')} className={linkClasses('home')}>Home</a>
                        <a onClick={() => handleNavigate('ourProcess')} className={linkClasses('ourProcess')}>Our Process</a>
                        <a onClick={() => handleNavigate('services')} className={linkClasses('services')}>Services</a>
                        <a onClick={() => handleNavigate('matchmaking')} className={linkClasses('matchmaking')}>Matchmaking</a>
                        <a onClick={() => handleNavigate('dashboard')} className={linkClasses('dashboard')}>My Dashboard</a>
                        <a onClick={() => handleNavigate('admin')} className={linkClasses('admin')}>Admin</a>
                    </nav>
                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-[#63372C] hover:bg-amber-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path></svg>
                        </button>
                    </div>
                </div>
            </div>
             {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#FDF6E9] border-t border-amber-200">
                    <nav className="flex flex-col space-y-1 px-2 py-3">
                        <a onClick={() => handleNavigate('home')} className={mobileLinkClasses('home')}>Home</a>
                        <a onClick={() => handleNavigate('ourProcess')} className={mobileLinkClasses('ourProcess')}>Our Process</a>
                        <a onClick={() => handleNavigate('services')} className={mobileLinkClasses('services')}>Services</a>
                        <a onClick={() => handleNavigate('matchmaking')} className={mobileLinkClasses('matchmaking')}>Matchmaking</a>
                        <a onClick={() => handleNavigate('dashboard')} className={mobileLinkClasses('dashboard')}>My Dashboard</a>
                        <a onClick={() => handleNavigate('admin')} className={mobileLinkClasses('admin')}>Admin</a>
                    </nav>
                </div>
            )}
        </header>
    );
}

function Footer() {
    return (
        <footer className="bg-[#63372C] text-white py-8 mt-12">
            <div className="container mx-auto px-4 sm:px-6 text-center">
                <p>&copy; 2025 PawCare. All rights reserved.</p>
                <p className="text-sm text-amber-100 mt-2">Connecting hearts, one paw at a time.</p>
            </div>
        </footer>
    );
}

const WhatsAppButton = () => (
    <a
        href="https://wa.me/919825664405" // Replace with your WhatsApp number
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-50"
        aria-label="Contact on WhatsApp"
    >
        <WhatsAppIcon className="w-8 h-8" />
    </a>
);


// --- Home Screen Component ---
function HomePage({ navigateTo, dogs, isLoading, featuredReviews }) {
    const [filters, setFilters] = useState({ age: '', gender: '', breed: '', price: '', location: '' });
    const [sortOption, setSortOption] = useState('default');
    const [activeCategory, setActiveCategory] = useState('all');

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    const handleCategoryClick = (category) => {
        if (category === 'match') {
            navigateTo('matchmaking');
            return;
        }
        setActiveCategory(category);
    };

    const sortedAndFilteredDogs = [...dogs]
        .filter(dog => {
            const { age, gender, breed, price, location } = filters;
            if (gender && dog.gender !== gender) return false;
            if (age) {
                if (age === '1' && dog.age > 1) return false;
                if (age === '3' && (dog.age <= 1 || dog.age > 3)) return false;
                if (age === '5' && dog.age <= 3) return false;
            }
            if (price) {
                if (price === '6000' && dog.price > 6000) return false;
                if (price === '8000' && (dog.price <= 6000 || dog.price > 8000)) return false;
                if (price === '8001' && dog.price <= 8000) return false;
            }
            if (breed && dog.breed !== breed) return false;
            if (location && !dog.location.toLowerCase().includes(location.toLowerCase())) return false;
            
            let categoryMatch = true;
            if (activeCategory === 'top') {
                categoryMatch = dog.rating === 5;
            }
            
            return dog.status !== 'Sold' && categoryMatch;
        })
        .sort((a, b) => {
            switch (sortOption) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'age-asc':
                    return a.age - b.age;
                case 'age-desc':
                    return b.age - a.age;
                default:
                    return 0;
            }
        });

    if (activeCategory === 'new' && sortOption === 'default') {
        sortedAndFilteredDogs.reverse();
    }
    
    const uniqueBreeds = [...new Set(dogs.map(dog => dog.breed))].sort();

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="bg-amber-800 text-white rounded-2xl shadow-xl p-8 sm:p-12 text-center mb-12 bg-cover bg-center" style={{backgroundImage: "url('https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"}}>
                <div className="bg-black bg-opacity-50 rounded-2xl p-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Find Your Perfect Companion</h1>
                    <p className="text-lg text-amber-100">Buy or get Matched with your new best friend.</p>
                </div>
            </div>

            <FadeIn>
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-[#63372C] mb-4 text-center">Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <PeekingButton onClick={() => handleCategoryClick('all')} className={`p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all font-semibold ${activeCategory === 'all' ? 'ring-2 ring-[#8B4513] bg-amber-50 text-[#63372C]' : 'bg-white text-gray-700'}`}>All</PeekingButton>
                    <PeekingButton onClick={() => handleCategoryClick('buy')} className={`p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all font-semibold ${activeCategory === 'buy' ? 'ring-2 ring-[#8B4513] bg-amber-50 text-[#63372C]' : 'bg-white text-gray-700'}`}>Buy</PeekingButton>
                    <PeekingButton onClick={() => handleCategoryClick('match')} className={`p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all font-semibold ${activeCategory === 'match' ? 'ring-2 ring-[#8B4513] bg-amber-50 text-[#63372C]' : 'bg-white text-gray-700'}`}>Match</PeekingButton>
                    <PeekingButton onClick={() => handleCategoryClick('new')} className={`p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all font-semibold ${activeCategory === 'new' ? 'ring-2 ring-[#8B4513] bg-amber-50 text-[#63372C]' : 'bg-white text-gray-700'}`}>New Arrivals</PeekingButton>
                    <PeekingButton onClick={() => handleCategoryClick('top')} className={`p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all font-semibold ${activeCategory === 'top' ? 'ring-2 ring-[#8B4513] bg-amber-50 text-[#63372C]' : 'bg-white text-gray-700'}`}>Top Rated</PeekingButton>
                </div>
            </div>
            </FadeIn>

            <FadeIn>
            <div className="bg-white p-6 rounded-xl shadow-lg mb-12">
                <h3 className="text-xl font-bold text-[#63372C] mb-4">Find Your Pup</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    <input type="text" name="location" placeholder="Location (e.g., Delhi)" className="p-3 border-gray-300 border rounded-lg w-full focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]" onChange={handleFilterChange} />
                    <select name="gender" className="p-3 border-gray-300 border rounded-lg w-full focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]" onChange={handleFilterChange}>
                        <option value="">Any Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <select name="age" className="p-3 border-gray-300 border rounded-lg w-full focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]" onChange={handleFilterChange}>
                        <option value="">Any Age</option>
                        <option value="1">0-1 Year</option>
                        <option value="3">1-3 Years</option>
                        <option value="5">3+ Years</option>
                    </select>
                     <select name="breed" className="p-3 border-gray-300 border rounded-lg w-full focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]" onChange={handleFilterChange}>
                        <option value="">Any Breed</option>
                        {uniqueBreeds.map(breed => <option key={breed} value={breed}>{breed}</option>)}
                    </select>
                    <select name="price" className="p-3 border-gray-300 border rounded-lg w-full focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]" onChange={handleFilterChange}>
                        <option value="">Any Price</option>
                        <option value="6000">Below ₹6,000</option>
                        <option value="8000">₹6,000 - ₹8,000</option>
                        <option value="8001">Above ₹8,000</option>
                    </select>
                    <select name="sort" value={sortOption} className="p-3 border-gray-300 border rounded-lg w-full focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]" onChange={(e) => setSortOption(e.target.value)}>
                        <option value="default">Sort By</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="age-asc">Age: Youngest First</option>
                        <option value="age-desc">Age: Oldest First</option>
                    </select>
                </div>
            </div>
            </FadeIn>

            <FadeIn>
            <h2 className="text-3xl font-bold text-[#63372C] mb-6">Featured Pups</h2>
            </FadeIn>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => <DogCardSkeleton key={i} />)}
                </div>
            ) : (
                sortedAndFilteredDogs.length === 0 ? (
                    <FadeIn>
                    <div className="text-center py-12 bg-amber-50 rounded-lg">
                        <p className="text-lg text-gray-600">No dogs match your current filters.</p>
                        <p className="text-md text-gray-500 mt-2">Try changing your filters or go to the Admin page to add dogs!</p>
                    </div>
                    </FadeIn>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {sortedAndFilteredDogs.map(dog => <FadeIn key={dog.id}><DogCard dog={dog} navigateTo={navigateTo} /></FadeIn>)}
                    </div>
                )
            )}
            
            <FadeIn>
            <div className="mt-20">
                <h2 className="text-3xl font-bold text-[#63372C] mb-8 text-center">Happy Tails from Our Customers</h2>
                {featuredReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredReviews.map(review => (
                            <div key={review.id} className="bg-white p-6 rounded-xl shadow-lg">
                                 <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-6 h-6 text-yellow-500" isFilled={i < review.rating} />)}
                                </div>
                                <p className="text-gray-600 italic">"{review.reviewText}"</p>
                                <p className="text-right font-semibold text-[#63372C] mt-4">- {review.customerName} on {review.dogName}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No featured reviews yet. Check back soon!</p>
                )}
            </div>
            </FadeIn>
        </div>
    );
}

// --- Skeleton Loader Component ---
const DogCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="w-full h-56 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    );
};


// --- Dog Card with Image Loading ---
function DogCard({ dog, navigateTo }) {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer group" onClick={() => navigateTo('dogProfile', dog)}>
            <div className="relative overflow-hidden">
                <img
                    src={dog.gallery?.[0] || `https://placehold.co/400x300/FDF6E9/63372C?text=Image+Coming+Soon`}
                    alt={dog.name}
                    className={`w-full h-56 object-cover transition-all duration-500 ease-in-out group-hover:scale-110 ${isLoaded ? 'blur-0' : 'blur-md'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/CCCCCC/FFFFFF?text=Image+Error'; }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                </div>
                {dog.status === 'In Training' && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 group">
                        In Training
                        <div className="relative">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                            <span className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-1/2 -translate-x-1/2">
                                 This pup is learning basic commands and will be ready soon!
                            </span>
                        </div>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <StarIcon className="w-4 h-4 mr-1" />
                    <span>{dog.rating}</span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold text-[#63372C] group-hover:text-[#8B4513] transition-colors">{dog.name}</h3>
                <p className="text-gray-600">{dog.breed}</p>
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                    <LocationMarkerIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>{dog.location}</span>
                </div>
                <div className="mt-4 text-2xl text-gray-800 font-bold">
                    <span className="text-lg">₹</span>{dog.price.toLocaleString('en-IN')}
                </div>
            </div>
        </div>
    );
}

// --- Dog Profile Page Component ---
function DogProfilePage({ dog, navigateTo, userId, favorites, showAlert }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);
    const isFavorited = favorites.includes(dog?.id);

    useEffect(() => {
        setCurrentIndex(0);
        setIsImageLoaded(false);
    }, [dog]);

    const handleFavoriteToggle = async () => {
        if (!userId || !dog || !db) return;
        
        setIsAnimatingHeart(true);
        setTimeout(() => setIsAnimatingHeart(false), 300);

        const appId = firebaseConfig.appId; // Use appId from your config
        const favoriteDocPath = `artifacts/${appId}/users/${userId}/favorites/${dog.id}`;
        try {
            if (isFavorited) {
                await deleteDoc(doc(db, favoriteDocPath));
            } else {
                await setDoc(doc(db, favoriteDocPath), { dogName: dog.name, addedAt: new Date() });
            }
        } catch (error) {
            console.error("Error updating favorites:", error);
            showAlert("Failed to update favorites.");
        }
    };

    const handleBuyNow = () => {
        setIsModalOpen(true);
    };
    
    const nextSlide = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % dog.gallery.length);
    };

    const prevSlide = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + dog.gallery.length) % dog.gallery.length);
    };

    if (!dog) return <div className="text-center p-12">Dog not found. Please go <a className="text-[#8B4513] cursor-pointer" onClick={() => navigateTo('home')}>home</a>.</div>;

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <FadeIn>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Column */}
                        <div className="p-4 sm:p-6">
                            <div className="relative overflow-hidden rounded-xl shadow-lg">
                                <img
                                    src={dog.gallery[currentIndex]}
                                    alt={dog.name}
                                    className={`w-full h-96 object-cover transition-all duration-500 ease-in-out ${isImageLoaded ? 'blur-0' : 'blur-md'}`}
                                     onLoad={() => setIsImageLoaded(true)}
                                />
                                <button onClick={prevSlide} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={nextSlide} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                                {dog.videoUrl && (
                                    <a href={dog.videoUrl} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors">
                                        <PlayIcon className="w-6 h-6" />
                                    </a>
                                )}
                            </div>
                            <div className="grid grid-cols-5 gap-2 sm:gap-4 mt-4">
                                {(dog.gallery || []).map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`${dog.name} ${index + 1}`}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-full h-20 object-cover rounded-lg cursor-pointer transition-all duration-200 ${currentIndex === index ? 'ring-4 ring-[#8B4513]' : 'hover:opacity-80'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Details Column */}
                        <div className="p-6 md:p-8">
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#63372C]">{dog.name}</h1>
                            <p className="text-xl text-gray-600 mb-4">{dog.breed}</p>
                            
                             {/* Tabs */}
                            <div className="border-b border-amber-200 mb-6">
                                <nav className="-mb-px flex space-x-6">
                                    <button onClick={() => setActiveTab('details')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-[#8B4513] text-[#63372C]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Details</button>
                                    <button onClick={() => setActiveTab('health')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'health' ? 'border-[#8B4513] text-[#63372C]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Health & Training</button>
                                </nav>
                            </div>

                            {activeTab === 'details' && (
                                <div>
                                    <div className="flex items-center mb-6 flex-wrap">
                                        <span className="bg-amber-100 text-amber-800 text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">{dog.age} years old</span>
                                        <span className="bg-pink-100 text-pink-800 text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">{dog.gender}</span>
                                        <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">{dog.temperament}</span>
                                    </div>
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <h3 className="font-bold text-lg text-[#63372C]">Trainer Rating</h3>
                                            <div className="flex items-center text-yellow-500">
                                                {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-6 h-6" isFilled={i < dog.rating} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-[#63372C]">Location</h3>
                                            <p className="text-gray-700">{dog.location}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'health' && (
                                <div>
                                    <div className="mb-6">
                                        <h3 className="font-bold text-lg text-[#63372C] mb-2">Health Card</h3>
                                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                                            {(dog.vetChecks || []).map((check, i) => <li key={i}>{check}</li>)}
                                            {(!dog.vetChecks || dog.vetChecks.length === 0) && <li>No vet checks recorded.</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[#63372C] mb-2">Basic Obedience Training</h3>
                                        <div className="w-full bg-amber-100 rounded-full h-4">
                                            <div className="bg-[#8B4513] h-4 rounded-full text-xs font-medium text-amber-100 text-center p-0.5 leading-none" style={{ width: `${dog.trainingProgress || 0}%` }}>
                                                {dog.trainingProgress || 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="text-4xl font-bold text-[#8B4513] my-8">
                                ₹{dog.price.toLocaleString('en-IN')}
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                <PeekingButton onClick={handleBuyNow} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold text-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">Buy Now</PeekingButton>
                                <PeekingButton onClick={handleFavoriteToggle} className={`w-full sm:w-auto mt-4 sm:mt-0 py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isFavorited ? 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-500' : 'bg-amber-100 text-[#63372C] hover:bg-amber-200 focus:ring-amber-400'}`}>
                                    <HeartIcon className={`w-6 h-6 mr-2 transition-transform duration-300 ${isAnimatingHeart ? 'scale-150' : 'scale-100'}`} isFilled={isFavorited} />
                                    {isFavorited ? 'Favorited' : 'Add to Favorites'}
                                </PeekingButton>
                            </div>
                        </div>
                    </div>
                </div>
                </FadeIn>
            </div>
            {isModalOpen && <PurchaseModal dog={dog} closeModal={() => setIsModalOpen(false)} navigateTo={navigateTo} userId={userId} showAlert={showAlert} />}
        </>
    );
}

// --- Purchase Modal Component ---
function PurchaseModal({ dog, closeModal, navigateTo, userId, showAlert }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        delivery: 'pickup',
        reserve: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId || !db) {
            showAlert("You must be logged in to submit an inquiry.");
            return;
        }
        
        const inquiryData = {
            ...formData,
            dogName: dog.name,
            dogId: dog.id,
            timestamp: new Date()
        };

        try {
            const appId = firebaseConfig.appId; // Use appId from your config
            const inquiriesCollectionPath = `artifacts/${appId}/users/${userId}/inquiries`;
            await addDoc(collection(db, inquiriesCollectionPath), inquiryData);
            closeModal();
            navigateTo('checkout', { dog, inquiry: inquiryData });
        } catch (error) {
            console.error("Error submitting inquiry: ", error);
            showAlert("There was an error submitting your inquiry. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative">
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-[#63372C] mb-2">Purchase Inquiry</h2>
                    <p className="text-gray-600 mb-6">You are inquiring about <span className="font-semibold">{dog.name}</span>, the {dog.breed}.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" name="name" placeholder="Your Full Name" className="w-full p-3 border border-gray-300 rounded-lg" onChange={handleChange} required />
                        <input type="tel" name="phone" placeholder="Your Phone Number" className="w-full p-3 border border-gray-300 rounded-lg" onChange={handleChange} required />
                        <textarea name="address" placeholder="Your Full Address" rows="3" className="w-full p-3 border border-gray-300 rounded-lg" onChange={handleChange} required></textarea>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Delivery Option</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center"><input type="radio" name="delivery" value="pickup" checked={formData.delivery === 'pickup'} onChange={handleChange} className="mr-2" /> Pickup</label>
                                <label className="flex items-center"><input type="radio" name="delivery" value="delivery" checked={formData.delivery === 'delivery'} onChange={handleChange} className="mr-2" /> Home Delivery</label>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="reserve" name="reserve" checked={formData.reserve} onChange={handleChange} className="mr-2" />
                            <label htmlFor="reserve">Reserve this dog (small upfront payment may be needed)</label>
                        </div>
                        <PeekingButton type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">Proceed to Checkout</PeekingButton>
                    </form>
                </div>
            </div>
        </div>
    );
}


// --- Matchmaking Page Component ---
function MatchmakingPage({ dogs, navigateTo }) {
    const [preferences, setPreferences] = useState({
        homeSize: '',
        hasKids: '',
        activityLevel: ''
    });
    const [matches, setMatches] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const handlePreferenceChange = (e) => {
        const { name, value } = e.target;
        setPreferences(prev => ({ ...prev, [name]: value }));
    };

    const calculateMatches = (filterFn) => {
        let availableDogs = dogs.filter(dog => dog.status !== 'Sold');
        let scoredDogs = [];

        if (filterFn) {
            scoredDogs = availableDogs.filter(filterFn).map(dog => ({ dog, score: 100 }));
        } else {
            scoredDogs = availableDogs.map(dog => {
                let score = 0;
                // Activity level match
                if (preferences.activityLevel === dog.activity) { score += 40; }
                else if (preferences.activityLevel === 'high' && dog.activity === 'medium') { score += 15; }
                else if (preferences.activityLevel === 'low' && dog.activity === 'medium') { score += 15; }

                // Kids match
                if (preferences.hasKids === 'yes' && (dog.temperament.includes('friendly') || dog.temperament.includes('loving') || dog.temperament.includes('gentle'))) { score += 30; }
                else if (preferences.hasKids === 'no') { score += 10; }

                // Home size match
                if (preferences.homeSize === 'large') {
                    score += 15;
                    if (dog.activity === 'high') score += 15;
                } else if (preferences.homeSize === 'small') {
                    if (dog.activity === 'low') score += 30;
                    if (dog.activity === 'medium') score += 10;
                }
                return { dog, score };
            });
        }

        const finalMatches = scoredDogs
            .filter(item => item.score > 0)
             .sort((a, b) => b.score - a.score)
             .slice(0, 3);
            
        setMatches(finalMatches.map(item => item.dog));
        setSubmitted(true);
    };

    const handleQuickFilter = (type) => {
        let filterFunction;
        if (type === 'family') {
            filterFunction = (dog) => dog.temperament.includes('friendly') || dog.temperament.includes('loving');
        } else if (type === 'guard') {
            filterFunction = (dog) => dog.temperament.includes('protective') || dog.temperament.includes('loyal');
        } else if (type === 'lowMaintenance') {
            filterFunction = (dog) => dog.maintenance === 'low';
        }
        calculateMatches(filterFunction);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        calculateMatches(null);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <FadeIn>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-2 text-[#63372C]">Find Your Perfect Match</h1>
                <p className="text-lg text-gray-600 text-center mb-8">Answer a few questions to find the best companion for your lifestyle.</p>

                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 className="text-xl font-bold text-[#63372C] mb-4">Or, Use a Quick Filter...</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <PeekingButton onClick={() => handleQuickFilter('family')} className="p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors">Family-Friendly</PeekingButton>
                        <PeekingButton onClick={() => handleQuickFilter('guard')} className="p-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">Guard Dogs</PeekingButton>
                        <PeekingButton onClick={() => handleQuickFilter('lowMaintenance')} className="p-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">Low-Maintenance</PeekingButton>
                    </div>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">What is your home size?</label>
                                <select name="homeSize" onChange={handlePreferenceChange} className="w-full p-3 border-gray-300 border rounded-lg focus:ring-2 focus:ring-[#8B4513]" required>
                                    <option value="">Select...</option>
                                    <option value="small">Apartment / Small Home</option>
                                    <option value="large">House with a Yard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Do you have kids at home?</label>
                                <select name="hasKids" onChange={handlePreferenceChange} className="w-full p-3 border-gray-300 border rounded-lg focus:ring-2 focus:ring-[#8B4513]" required>
                                    <option value="">Select...</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">What's your preferred activity level?</label>
                                <select name="activityLevel" onChange={handlePreferenceChange} className="w-full p-3 border-gray-300 border rounded-lg focus:ring-2 focus:ring-[#8B4513]" required>
                                    <option value="">Select...</option>
                                    <option value="low">Low (Relaxed walks)</option>
                                    <option value="medium">Medium (Daily playtime & walks)</option>
                                    <option value="high">High (Running & hiking partner)</option>
                                </select>
                            </div>
                        </div>
                        <PeekingButton type="submit" className="w-full mt-8 bg-[#8B4513] text-white py-3 rounded-lg hover:bg-[#63372C] font-bold text-lg transition-colors">Find My Matches</PeekingButton>
                    </form>
                ) : (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[#63372C] mb-6">Your Top Matches!</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {matches.length > 0 ? (
                                matches.map(dog => <DogCard key={dog.id} dog={dog} navigateTo={navigateTo} />)
                            ) : (
                                <p className="col-span-full text-center text-gray-600 bg-yellow-100 p-4 rounded-lg">No perfect matches found based on your criteria. Try different options!</p>
                            )}
                        </div>
                        <PeekingButton onClick={() => setSubmitted(false)} className="mt-8 bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 font-semibold transition-colors">Try Again</PeekingButton>
                    </div>
                )}
            </div>
            </FadeIn>
        </div>
    );
}

// --- Client Dashboard Component ---
function ClientDashboard({ userId, favoritedDogs, purchasedDogs, productOrders, navigateTo, showAlert }) {
    const [feedback, setFeedback] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [reviewingDog, setReviewingDog] = useState(null);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!userId || !feedback || !db) return;
        
        try {
            const appId = firebaseConfig.appId; // Use appId from your config
            const feedbackCollectionPath = `artifacts/${appId}/users/${userId}/feedback`;
            await addDoc(collection(db, feedbackCollectionPath), {
                feedback: feedback,
                timestamp: new Date()
            });
            setFeedback('');
            setFeedbackMessage('Thank you for your feedback!');
            setTimeout(() => setFeedbackMessage(''), 3000); // Clear message after 3 seconds
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setFeedbackMessage('Failed to submit feedback.');
        }
    };
    
    return (
        <>
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <FadeIn>
            <h1 className="text-4xl font-bold text-[#63372C] mb-8">My Dashboard</h1>
            </FadeIn>

            {/* My Favorite Dogs */}
            <FadeIn>
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-[#63372C] mb-4">My Favorite Dogs</h2>
                {favoritedDogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoritedDogs.map(dog => <DogCard key={dog.id} dog={dog} navigateTo={navigateTo} />)}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <HeartIcon className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No Favorites Yet!</h3>
                        <p className="mt-1 text-sm text-gray-500">Click the heart on a dog's profile to save them here.</p>
                        <div className="mt-6">
                            <PeekingButton
                                onClick={() => navigateTo('home')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#8B4513] hover:bg-[#63372C]"
                            >
                                Find Your New Friend
                            </PeekingButton>
                        </div>
                    </div>
                )}
            </div>
            </FadeIn>

            {/* Purchase History */}
            <FadeIn>
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-[#63372C] mb-4">My Purchase History</h2>
                {purchasedDogs.length > 0 ? (
                     <div className="space-y-4">
                        {purchasedDogs.map(dog => (
                            <div key={dog.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <img src={dog.gallery?.[0]} alt={dog.name} className="w-20 h-20 object-cover rounded-lg mr-4" />
                                    <div>
                                        <h3 className="font-bold text-lg">{dog.name}</h3>
                                        <p className="text-gray-600">{dog.breed}</p>
                                    </div>
                                </div>
                                <PeekingButton onClick={() => setReviewingDog(dog)} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                                    Leave a Review
                                </PeekingButton>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-16 w-16 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No Purchases Yet!</h3>
                        <p className="mt-1 text-sm text-gray-500">Your past dog purchases will appear here.</p>
                    </div>
                )}
            </div>
            </FadeIn>

            {/* My Product Orders */}
            <FadeIn>
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-[#63372C] mb-4">My Product Orders</h2>
                {productOrders.length > 0 ? (
                     <div className="space-y-4">
                        {productOrders.map(order => (
                            <div key={order.id} className="p-4 border rounded-lg">
                                <p className="font-semibold text-gray-700">Order Date: {new Date(order.orderDate.seconds * 1000).toLocaleDateString()}</p>
                                <ul className="list-disc list-inside mt-2 pl-4">
                                    {order.items.map((item, index) => <li key={index}>{item.name} - ₹{parseInt(item.price).toLocaleString('en-IN')}</li>)}
                                </ul>
                                <p className="font-bold text-right mt-2 text-lg">Total: ₹{order.total.toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">You haven't purchased any products yet. Visit our Essentials Shop!</p>
                )}
            </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Feedback Form */}
                <FadeIn>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-[#63372C] mb-4">Leave Feedback</h2>
                    <form onSubmit={handleFeedbackSubmit}>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us about your experience..."
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                            required
                        />
                        <PeekingButton type="submit" className="w-full bg-[#8B4513] text-white py-2 rounded-lg font-semibold hover:bg-[#63372C]">Submit Feedback</PeekingButton>
                        {feedbackMessage && <p className="mt-4 text-center text-green-600">{feedbackMessage}</p>}
                    </form>
                </div>
                </FadeIn>

                {/* Refer a Friend */}
                <FadeIn>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-[#63372C] mb-4">Refer a Friend</h2>
                    <p className="text-gray-600 mb-4">Share your referral code with friends!</p>
                    <div className="bg-amber-50 p-3 rounded-lg text-center font-mono text-[#63372C] break-all">
                        {userId}
                    </div>
                    <PeekingButton
                        onClick={() => {
                            navigator.clipboard.writeText(userId);
                            showAlert('Referral code copied to clipboard!');
                        }}
                        className="w-full mt-4 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700"
                    >
                        Copy Code
                    </PeekingButton>
                </div>
                </FadeIn>
            </div>
        </div>
        {reviewingDog && <ReviewModal dog={reviewingDog} closeModal={() => setReviewingDog(null)} userId={userId} showAlert={showAlert} />}
        </>
    );
}


function AdminPage({ dogs, inquiries, reviews, productOrders, userId, showAlert }) {
    const [message, setMessage] = useState('');
    const [isDogFormOpen, setIsDogFormOpen] = useState(false);
    const [editingDog, setEditingDog] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const handleAddNewDog = () => {
        setEditingDog(null);
        setIsDogFormOpen(true);
    };

    const handleEditDog = (dog) => {
        setEditingDog(dog);
        setIsDogFormOpen(true);
    };

    const handleDeleteDog = (dogId) => {
        setConfirmAction(() => async () => {
            if (!userId || !db) return;
            try {
                const appId = firebaseConfig.appId; // Use appId from your config
                const dogDocPath = `artifacts/${appId}/users/${userId}/dogs/${dogId}`;
                await deleteDoc(doc(db, dogDocPath));
                setMessage("Dog listing deleted successfully.");
            } catch (error) {
                console.error("Error deleting dog: ", error);
                setMessage("Failed to delete dog listing.");
            }
        });
        setIsConfirmOpen(true);
    };
    
    const addSampleDogs = async () => {
        if (!userId || !db) { setMessage('Error: You must be logged in to add dogs.'); return; }
        setMessage('Adding sample dogs...');
        const appId = firebaseConfig.appId; // Use appId from your config
        const dogsCollectionPath = `artifacts/${appId}/users/${userId}/dogs`;
        const collectionRef = collection(db, dogsCollectionPath);
        const existingDocs = await getDocs(collectionRef);
        if (!existingDocs.empty) { setMessage('You already have dogs. Please clear them first to add new samples.'); return; }
        let count = 0;
        for (const dog of sampleDogs) {
            try { await addDoc(collectionRef, dog); count++; } catch (error) { console.error("Error adding sample dog:", error); }
        }
        setMessage(`${count} sample dogs added successfully!`);
    };

    const clearAllDogs = () => {
        setConfirmAction(() => async () => {
            if (!userId || !db) { setMessage('Error: You must be logged in to clear dogs.'); return; }
            setMessage('Clearing all dogs...');
            const appId = firebaseConfig.appId; // Use appId from your config
            const dogsCollectionPath = `artifacts/${appId}/users/${userId}/dogs`;
            const collectionRef = collection(db, dogsCollectionPath);
            const querySnapshot = await getDocs(collectionRef);
            const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(doc(db, dogsCollectionPath, docSnap.id)));
            try {
                await Promise.all(deletePromises);
                setMessage('All dogs cleared. You can now add new samples.');
            } catch (error) {
                console.error("Error clearing dogs: ", error);
                setMessage('Failed to clear all dogs.');
            }
        });
        setIsConfirmOpen(true);
    };
    
    const toggleFeaturedReview = async (review) => {
        if (!db) return;
        const appId = firebaseConfig.appId; // Use appId from your config
        const reviewDocPath = `artifacts/${appId}/public/data/reviews/${review.id}`;
        try {
            await updateDoc(doc(db, reviewDocPath), { isFeatured: !review.isFeatured });
            setMessage(`Review for ${review.dogName} has been ${!review.isFeatured ? 'featured' : 'unfeatured'}.`);
        } catch (error) {
            console.error("Error updating review:", error);
        }
    };

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <FadeIn>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#63372C]">Admin Panel</h1>
                    <PeekingButton onClick={handleAddNewDog} className="bg-[#8B4513] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#63372C] transition-colors">
                        + Add New Dog
                    </PeekingButton>
                </div>
                </FadeIn>

                <FadeIn>
                {/* Setup Sample Data Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-bold mb-4">Setup Sample Data</h3>
                    <p className="text-gray-600 mb-4">Click to add sample dogs. If you have existing dogs, you must clear them first.</p>
                    <div className="flex space-x-4">
                        <PeekingButton onClick={addSampleDogs} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Add Sample Dogs</PeekingButton>
                        <PeekingButton onClick={clearAllDogs} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Clear All Dogs</PeekingButton>
                    </div>
                </div>
                </FadeIn>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FadeIn>
                    {/* Manage Dog Listings */}
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                        <h2 className="text-2xl font-bold text-[#63372C] mb-4">Manage Dog Listings</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {dogs.map(dog => (
                                <div key={dog.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg bg-amber-50">
                                    <div className="mb-2 sm:mb-0">
                                        <p className="font-bold text-lg">{dog.name} <span className="font-normal text-gray-600">({dog.breed})</span></p>
                                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                                            dog.status === 'Sold' ? 'bg-red-200 text-red-800' :
                                            dog.status === 'In Training' ? 'bg-yellow-200 text-yellow-800' :
                                            'bg-green-200 text-green-800'
                                        }`}>{dog.status}</span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button onClick={() => handleEditDog(dog)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600">Edit</button>
                                        <button onClick={() => handleDeleteDog(dog.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    </FadeIn>

                    <FadeIn>
                    {/* Manage Reviews */}
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                        <h2 className="text-2xl font-bold text-[#63372C] mb-4">Manage Reviews</h2>
                         <div className="space-y-4 max-h-96 overflow-y-auto">
                            {reviews.length > 0 ? reviews.map(review => (
                                <div key={review.id} className="p-4 border rounded-lg bg-amber-50">
                                    <div className="flex items-center mb-2">
                                        {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-500" isFilled={i < review.rating} />)}
                                    </div>
                                    <p className="italic text-gray-700">"{review.reviewText}"</p>
                                    <p className="font-semibold mt-2">- {review.customerName} for {review.dogName}</p>
                                    <button onClick={() => toggleFeaturedReview(review)} className={`mt-2 text-sm px-3 py-1 rounded-md font-semibold ${review.isFeatured ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        {review.isFeatured ? 'Featured' : 'Feature on Home Page'}
                                    </button>
                                </div>
                            )) : <p className="text-gray-500">No reviews have been submitted yet.</p>}
                        </div>
                    </div>
                    </FadeIn>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FadeIn>
                    {/* View Client Inquiries */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-[#63372C] mb-4">Dog Purchase Inquiries</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {inquiries.length > 0 ? inquiries.map(inquiry => (
                                <div key={inquiry.id} className="p-4 border rounded-lg bg-amber-50">
                                    <p><span className="font-semibold">Dog:</span> {inquiry.dogName}</p>
                                    <p><span className="font-semibold">Client:</span> {inquiry.name}</p>
                                    <p><span className="font-semibold">Phone:</span> {inquiry.phone}</p>
                                    <p><span className="font-semibold">Address:</span> {inquiry.address}</p>
                                    <p><span className="font-semibold">Option:</span> {inquiry.delivery}</p>
                                    {inquiry.reserve && <p className="font-bold text-[#8B4513]">Requested Reservation</p>}
                                </div>
                            )) : <p className="text-gray-500">No client inquiries yet.</p>}
                        </div>
                    </div>
                    </FadeIn>

                    <FadeIn>
                    {/* View Client Product Orders */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-[#63372C] mb-4">Client Product Orders</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {productOrders.length > 0 ? productOrders.map(order => (
                                <div key={order.id} className="p-4 border rounded-lg bg-blue-50">
                                    <p className="font-semibold">Order from User: <span className="font-mono text-sm">{order.userId}</span></p>
                                    <ul className="list-disc list-inside mt-2">
                                        {order.items.map((item, index) => <li key={index}>{item.name} - {item.price}</li>)}
                                    </ul>
                                    <p className="font-bold text-right mt-2">Total: ₹{order.total.toLocaleString('en-IN')}</p>
                                </div>
                            )) : <p className="text-gray-500">No product orders yet.</p>}
                        </div>
                    </div>
                    </FadeIn>
                </div>
                 {message && <p className="mt-4 font-semibold text-center text-[#8B4513]">{message}</p>}
            </div>
            {isDogFormOpen && <DogFormModal dog={editingDog} closeModal={() => setIsDogFormOpen(false)} userId={userId} showAlert={showAlert} />}
            {isConfirmOpen && (
                <ConfirmationModal
                    message="Are you sure you want to proceed with this action? This cannot be undone."
                    onConfirm={() => {
                        if (confirmAction) confirmAction();
                        setIsConfirmOpen(false);
                     }}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            )}
        </>
    );
}

// --- Confirmation Modal ---
function ConfirmationModal({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm text-center">
                <p className="text-lg text-gray-800 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                    <PeekingButton onClick={onCancel} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400">
                        Cancel
                    </PeekingButton>
                    <PeekingButton onClick={onConfirm} className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600">
                        Confirm
                    </PeekingButton>
                </div>
            </div>
        </div>
    );
}


// --- Dog Form Modal (for Add/Edit) ---
function DogFormModal({ dog, closeModal, userId, showAlert }) {
    const [formData, setFormData] = useState({
        name: dog?.name || '',
        breed: dog?.breed || '',
        price: dog?.price || 5000,
        age: dog?.age || 1,
        gender: dog?.gender || 'Male',
        health: dog?.health || 'Vet Checked',
        temperament: dog?.temperament || '',
        rating: dog?.rating || 4,
        status: dog?.status || 'Ready',
        maintenance: dog?.maintenance || 'low',
        activity: dog?.activity || 'medium',
        gallery: dog?.gallery?.join(', ') || '',
        videoUrl: dog?.videoUrl || '',
        trainingProgress: dog?.trainingProgress || 0,
        vetChecks: dog?.vetChecks?.join('\n') || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId || !db) {
            showAlert("Authentication error.");
            return;
        }

        const dogData = {
            ...formData,
            price: Number(formData.price),
            age: Number(formData.age),
            rating: Number(formData.rating),
            trainingProgress: Number(formData.trainingProgress),
            gallery: formData.gallery.split(',').map(url => url.trim()).filter(url => url),
            vetChecks: formData.vetChecks.split('\n').map(line => line.trim()).filter(line => line),
        };

        try {
            const appId = firebaseConfig.appId; // Use appId from your config
            if (dog) { // Editing existing dog
                const dogDocPath = `artifacts/${appId}/users/${userId}/dogs/${dog.id}`;
                await updateDoc(doc(db, dogDocPath), dogData);
            } else { // Adding new dog
                const dogsCollectionPath = `artifacts/${appId}/users/${userId}/dogs`;
                await addDoc(collection(db, dogsCollectionPath), dogData);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving dog data: ", error);
            showAlert("Failed to save dog data.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-[#63372C] mb-6">{dog ? 'Edit Dog Listing' : 'Add New Dog Listing'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                            <input type="text" name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                            <input type="number" name="rating" placeholder="Rating (1-5)" min="1" max="5" value={formData.rating} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg">
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg">
                                <option>Ready</option>
                                <option>In Training</option>
                                <option>Sold</option>
                            </select>
                        </div>
                        <input type="text" name="temperament" placeholder="Temperament (e.g., Friendly, Playful)" value={formData.temperament} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <select name="activity" value={formData.activity} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="low">Low Activity</option>
                                <option value="medium">Medium Activity</option>
                                <option value="high">High Activity</option>
                            </select>
                            <select name="maintenance" value={formData.maintenance} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="low">Low Maintenance</option>
                                <option value="medium">Medium Maintenance</option>
                                <option value="high">High Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Training Progress (%)</label>
                            <input type="number" name="trainingProgress" min="0" max="100" value={formData.trainingProgress} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vet Checks (one per line)</label>
                            <textarea name="vetChecks" placeholder="Vet check 1&#10;Vet check 2" rows="3" value={formData.vetChecks} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image Gallery URLs (comma separated)</label>
                            <textarea name="gallery" placeholder="https://.../img1.jpg, https://.../img2.jpg" rows="3" value={formData.gallery} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <input type="text" name="videoUrl" placeholder="YouTube Video URL (optional)" value={formData.videoUrl} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                        <PeekingButton type="submit" className="w-full bg-[#8B4513] text-white py-3 rounded-lg font-bold hover:bg-[#63372C] transition-colors">{dog ? 'Save Changes' : 'Add Dog'}</PeekingButton>
                    </form>
                </div>
            </div>
        </div>
    );
}

// --- Checkout and Success Pages ---

function CheckoutPage({ checkoutInfo, navigateTo, userId }) {
    const { dog, inquiry } = checkoutInfo;

    const handlePayment = async () => {
        if (!userId || !dog || !db) return;

        // 1. Mark the dog as "Sold"
        const appId = firebaseConfig.appId; // Use appId from your config
        const dogDocPath = `artifacts/${appId}/users/${userId}/dogs/${dog.id}`;
        await updateDoc(doc(db, dogDocPath), { status: 'Sold' });

        // 2. Add to user's purchase history
        const purchaseData = {
            dogId: dog.id,
            dogName: dog.name,
            price: dog.price,
            purchaseDate: new Date(),
            ...inquiry
        };
        const purchasesCollectionPath = `artifacts/${appId}/users/${userId}/purchases`;
        await addDoc(collection(db, purchasesCollectionPath), purchaseData);
        
        // 3. Navigate to success page
        navigateTo('orderSuccess', dog);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-[#63372C] mb-6">Secure Checkout</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Order Summary</h2>
                        <div className="border rounded-lg p-4 flex items-center">
                            <img src={dog.gallery[0]} alt={dog.name} className="w-24 h-24 object-cover rounded-lg mr-4" />
                            <div>
                                <h3 className="font-bold">{dog.name}</h3>
                                <p className="text-gray-600">{dog.breed}</p>
                                <p className="font-bold text-lg mt-2">₹{dog.price.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500 flex items-center">
                            <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-500" />
                            <span>All transactions are secure and encrypted.</span>
                        </div>
                    </div>
                    {/* Payment Method */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Select Payment Method</h2>
                        <div className="space-y-3">
                            <div className="border rounded-lg p-4 flex items-center justify-between">
                                <label htmlFor="upi" className="font-semibold">UPI (Paytm, GPay, etc.)</label>
                                <input type="radio" id="upi" name="payment" defaultChecked />
                            </div>
                             <div className="border rounded-lg p-4 flex items-center justify-between">
                                <label htmlFor="card" className="font-semibold">Credit / Debit Card</label>
                                <input type="radio" id="card" name="payment" />
                            </div>
                             <div className="border rounded-lg p-4 flex items-center justify-between">
                                <label htmlFor="netbanking" className="font-semibold">Net Banking</label>
                                <input type="radio" id="netbanking" name="payment" />
                            </div>
                        </div>
                        <PeekingButton onClick={handlePayment} className="w-full mt-8 bg-[#8B4513] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#63372C] transition-colors">
                            Pay Securely
                        </PeekingButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderSuccessPage({ dog, navigateTo }) {
     if (!dog) return <div className="text-center p-12">Order details not found.</div>;
    return (
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 text-lg">Congratulations on your new companion, {dog.name}!</p>
                <img src={dog.gallery[0]} alt={dog.name} className="w-48 h-48 object-cover rounded-full my-6 mx-auto shadow-lg" />
                <p className="text-gray-500">We have received your details and will be in touch shortly to arrange the pickup or delivery.</p>
                <PeekingButton onClick={() => navigateTo('dashboard')} className="mt-8 bg-[#8B4513] text-white py-3 px-8 rounded-lg font-bold hover:bg-[#63372C] transition-colors">
                    Go to My Dashboard
                </PeekingButton>
            </div>
        </div>
    );
}

// --- Review Modal Component ---
function ReviewModal({ dog, closeModal, userId, showAlert }) {
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [customerName, setCustomerName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId || !reviewText || !customerName || !db) {
            showAlert("Please fill in all fields.");
            return;
        }

        const reviewData = {
            dogId: dog.id,
            dogName: dog.dogName,
            customerName,
            rating,
            reviewText,
            isFeatured: false, // Admin must approve to feature it
            timestamp: new Date(),
        };

        try {
            // Reviews are public, so they are stored in a public collection
            const appId = firebaseConfig.appId; // Use appId from your config
            const reviewsCollectionPath = `artifacts/${appId}/public/data/reviews`;
            await addDoc(collection(db, reviewsCollectionPath), reviewData);
            closeModal();
        } catch (error) {
            console.error("Error submitting review:", error);
            showAlert("Failed to submit review.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative">
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-[#63372C] mb-4">Leave a Review for {dog.dogName}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Your Name</label>
                            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 border rounded-lg" required />
                        </div>
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Rating</label>
                            <div className="flex">
                                {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <button type="button" key={ratingValue} onClick={() => setRating(ratingValue)}>
                                            <StarIcon className={`w-8 h-8 cursor-pointer ${ratingValue <= rating ? 'text-yellow-500' : 'text-gray-300'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mb-4">
                             <label className="block font-semibold mb-2">Your Review</label>
                            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows="4" className="w-full p-2 border rounded-lg" required></textarea>
                        </div>
                        <PeekingButton type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600">Submit Review</PeekingButton>
                    </form>
                </div>
            </div>
        </div>
    );
}

// --- UPDATED Services Page Component ---
function ServicesPage({ userId, showAlert, onPurchase }) {
    const [modal, setModal] = useState(null);

    return (
        <>
            {modal === 'grooming' && <GroomingModal closeModal={() => setModal(null)} userId={userId} showAlert={showAlert} />}
            {modal === 'vet' && <VetModal closeModal={() => setModal(null)} userId={userId} showAlert={showAlert} />}
            {modal === 'training' && <TrainingModal closeModal={() => setModal(null)} userId={userId} showAlert={showAlert} />}
            {modal === 'shop' && <ShopModal closeModal={() => setModal(null)} showAlert={showAlert} onPurchase={onPurchase} />}
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <FadeIn>
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#63372C] mb-2">Complete Care for Your Companion</h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">From their first check-up to their golden years, PawCare offers a full suite of premium services to ensure your dog lives a happy, healthy, and fulfilling life.</p>
                    </div>
                </FadeIn>

                {/* Health & Wellness Section */}
                <FadeIn>
                    <div className="mb-20">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <svg className="w-10 h-10 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <h2 className="text-3xl font-bold text-center text-[#63372C]">Health & Wellness</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <img src="https://images.pexels.com/photos/6235116/pexels-photo-6235116.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Vet Consultation" className="w-full h-56 object-cover rounded-lg mb-4"/>
                                <h3 className="text-2xl font-bold text-[#63372C] mb-2">Online Vet Consultation</h3>
                                <p className="text-gray-600 mb-4">Get expert advice from certified veterinarians from home. Perfect for follow-ups, nutritional advice, or minor health concerns.</p>
                                <PeekingButton onClick={() => setModal('vet')} className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">Book a Consultation</PeekingButton>
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <img src="https://images.pexels.com/photos/4588012/pexels-photo-4588012.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Grooming" className="w-full h-56 object-cover rounded-lg mb-4"/>
                                <h3 className="text-2xl font-bold text-[#63372C] mb-2">Grooming Spa</h3>
                                <p className="text-gray-600 mb-4">Treat your dog to a day of pampering. Our professional groomers provide a calm and safe environment.</p>
                                 <PeekingButton onClick={() => setModal('grooming')} className="w-full bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">View Grooming Packages</PeekingButton>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                 {/* Training & Enrichment Section */}
                <FadeIn>
                    <div className="mb-20">
                        <div className="flex items-center justify-center gap-4 mb-8">
                             <svg className="w-10 h-10 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            <h2 className="text-3xl font-bold text-center text-[#63372C]">Training & Enrichment</h2>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <img src="https://www.training.com.au/wp-content/uploads/dog-trainer.jpg" alt="Training" className="w-full h-full object-cover rounded-lg"/>
                                </div>
                                <div className="lg:col-span-2">
                                    <h3 className="text-2xl font-bold text-[#63372C] mb-2">Professional Training Packages</h3>
                                    <p className="text-gray-600 mb-6">Our certified trainers use positive reinforcement to build confidence and good manners in dogs of all ages.</p>
                                    <div className="space-y-4">
                                         <div className="border rounded-lg p-4">
                                            <h4 className="font-bold text-lg">Puppy Kickstarter (4 Weeks)</h4>
                                            <p className="text-sm text-gray-500">Socialization, potty training, and basic commands.</p>
                                            <p className="font-bold text-right text-lg text-[#63372C]">₹8,000</p>
                                        </div>
                                         <div className="border rounded-lg p-4">
                                            <h4 className="font-bold text-lg">Advanced Obedience (6 Weeks)</h4>
                                            <p className="text-sm text-gray-500">For graduates of our puppy course. Focuses on off-leash commands, distraction training, and more.</p>
                                            <p className="font-bold text-right text-lg text-[#63372C]">₹12,000</p>
                                        </div>
                                    </div>
                                    <PeekingButton onClick={() => setModal('training')} className="w-full mt-6 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">Enroll in Training</PeekingButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Lifestyle & Convenience */}
                <FadeIn>
                    <div>
                         <div className="flex items-center justify-center gap-4 mb-8">
                            <svg className="w-10 h-10 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            <h2 className="text-3xl font-bold text-center text-[#63372C]">Lifestyle & Convenience</h2>
                        </div>
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <img src="https://images.pexels.com/photos/8434685/pexels-photo-8434685.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Shop" className="w-full h-56 object-cover rounded-lg mb-4"/>
                                <h3 className="text-2xl font-bold text-[#63372C] mb-2">Essentials Shop</h3>
                                <p className="text-gray-600 mb-4">From premium food to durable toys, we've curated the best products to keep your companion happy and healthy.</p>
                                 <PeekingButton onClick={() => setModal('shop')} className="w-full bg-[#8B4513] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#63372C] transition-colors">Visit Our Shop</PeekingButton>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </>
    );
}


// --- NEW "Our Process" Page ---
const ProcessStep = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="bg-amber-100 text-[#8B4513] rounded-full p-5 mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-[#63372C] mb-2">{title}</h3>
        <p className="text-gray-600 max-w-xs">{description}</p>
    </div>
);

function OurProcessPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <FadeIn>
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#63372C] mb-2">Our Commitment to Excellence</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">We believe that a happy home starts with a healthy, well-adjusted companion. Here’s how we ensure every dog is ready for their new family.</p>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <FadeIn>
                    <ProcessStep
                        icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>}
                        title="Step 1: Expert Sourcing"
                        description="We partner with reputable and ethical breeders to ensure our dogs come from healthy and humane environments."
                    />
                </FadeIn>
                <FadeIn>
                    <ProcessStep
                        icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        title="Step 2: Health & Wellness"
                        description="Every dog undergoes a comprehensive vet check, is fully vaccinated, and dewormed. Their health is our top priority."
                    />
                </FadeIn>
                <FadeIn>
                     <ProcessStep
                        icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
                        title="Step 3: Professional Training"
                        description="Our dogs begin basic obedience and socialization training to ensure they are well-behaved and ready to integrate into your home."
                    />
                </FadeIn>
                <FadeIn>
                     <ProcessStep
                        icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>}
                        title="Step 4: Your Forever Home"
                        description="We provide a seamless and secure purchase process, with post-purchase support to help you and your new friend settle in."
                    />
                </FadeIn>
            </div>
        </div>
    );
}

// --- NEW Service Modal Components ---
const ServiceModal = ({ children, closeModal, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="p-8">
                <h2 className="text-3xl font-bold text-[#63372C] mb-6">{title}</h2>
                {children}
            </div>
        </div>
    </div>
);

const GroomingModal = ({ closeModal, userId, showAlert }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        showAlert("Thank you! We have received your booking request and will contact you shortly to confirm.");
        closeModal();
    };

    return (
       <ServiceModal closeModal={closeModal} title="Grooming Spa Packages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src="https://images.pexels.com/photos/4588012/pexels-photo-4588012.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Grooming" className="w-full h-48 object-cover rounded-lg mb-4"/>
                    <p className="text-gray-600 mb-4">Our grooming services are designed to keep your dog looking and feeling their best. We use only high-quality, pet-safe products.</p>
                    <div className="space-y-3">
                        <div className="border rounded-lg p-3">
                            <h4 className="font-bold">Full Groom</h4>
                            <p className="text-sm text-gray-500">Bath, haircut, nail trim, ear cleaning.</p>
                            <p className="font-bold text-right text-md text-[#63372C]">₹2,500</p>
                        </div>
                        <div className="border rounded-lg p-3">
                            <h4 className="font-bold">Bath & Brush</h4>
                            <p className="text-sm text-gray-500">A thorough wash and brush-out.</p>
                            <p className="font-bold text-right text-md text-[#63372C]">₹1,500</p>
                        </div>
                        <div className="border rounded-lg p-3">
                            <h4 className="font-bold">Puppy's First Groom</h4>
                            <p className="text-sm text-gray-500">A gentle introduction to grooming.</p>
                            <p className="font-bold text-right text-md text-[#63372C]">₹1,200</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#63372C] mb-4">Book an Appointment</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="tel" placeholder="Your Phone Number" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="text" placeholder="Your Dog's Name & Breed" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <select className="w-full p-3 border border-gray-300 rounded-lg" required>
                            <option value="">Select a Package</option>
                            <option value="full">Full Groom</option>
                            <option value="bath">Bath & Brush</option>
                            <option value="puppy">Puppy's First Groom</option>
                        </select>
                        <input type="date" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <PeekingButton type="submit" className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">Request Booking</PeekingButton>
                    </form>
                </div>
            </div>
       </ServiceModal>
    );
};

const VetModal = ({ closeModal, userId, showAlert }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        showAlert("Thank you! We've received your consultation request and will contact you to confirm your appointment.");
        closeModal();
    };

    return (
       <ServiceModal closeModal={closeModal} title="Online Vet Consultation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-[#63372C] mb-4">Meet Our Vets</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Dr. Sharma" className="w-20 h-20 object-cover rounded-full"/>
                            <div>
                                <h4 className="font-bold">Dr. Anjali Sharma</h4>
                                <p className="text-sm text-gray-500">General Practice & Nutrition</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <img src="https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Dr. Patel" className="w-20 h-20 object-cover rounded-full"/>
                            <div>
                                <h4 className="font-bold">Dr. Rohan Patel</h4>
                                <p className="text-sm text-gray-500">Behavioral Medicine</p>
                            </div>
                        </div>
                    </div>
                     <p className="text-gray-600 mt-6">Our certified veterinarians are here to provide expert advice for your peace of mind.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#63372C] mb-4">Request a Consultation</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="tel" placeholder="Your Phone Number" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <textarea placeholder="Briefly describe your concern..." rows="3" className="w-full p-3 border border-gray-300 rounded-lg" required></textarea>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date & Time</label>
                            <input type="datetime-local" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        </div>
                        <PeekingButton type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">Request Consultation</PeekingButton>
                    </form>
                </div>
            </div>
       </ServiceModal>
    );
};

const TrainingModal = ({ closeModal, userId, showAlert }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        showAlert("Thank you for your interest! We've received your enrollment request and will contact you shortly with the next steps.");
        closeModal();
    };

    return (
       <ServiceModal closeModal={closeModal} title="Professional Training Packages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img src="https://www.training.com.au/wp-content/uploads/dog-trainer.jpg" alt="Training" className="w-full h-48 object-cover rounded-lg mb-4"/>
                     <p className="text-gray-600 mb-4">Our certified trainers use positive reinforcement to build confidence and good manners in dogs of all ages. A well-trained dog is a happy dog!</p>
                     <div className="space-y-3">
                         <div className="border rounded-lg p-3">
                            <h4 className="font-bold">Puppy Kickstarter (4 Weeks)</h4>
                            <p className="text-sm text-gray-500">Essential for new owners. Covers socialization, potty training, and basic commands like sit, stay, and come.</p>
                            <p className="font-bold text-right text-md text-[#63372C]">₹8,000</p>
                        </div>
                         <div className="border rounded-lg p-3">
                            <h4 className="font-bold">Advanced Obedience (6 Weeks)</h4>
                            <p className="text-sm text-gray-500">For graduates of our puppy course. Focuses on off-leash commands, distraction training, and more.</p>
                            <p className="font-bold text-right text-md text-[#63372C]">₹12,000</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#63372C] mb-4">Enroll Now</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="tel" placeholder="Your Phone Number" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="text" placeholder="Your Dog's Name & Age" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <select className="w-full p-3 border border-gray-300 rounded-lg" required>
                            <option value="">Select a Package</option>
                            <option value="puppy">Puppy Kickstarter</option>
                            <option value="advanced">Advanced Obedience</option>
                        </select>
                         <textarea placeholder="Any specific behavioral issues? (optional)" rows="2" className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                        <PeekingButton type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">Request Enrollment</PeekingButton>
                    </form>
                </div>
            </div>
       </ServiceModal>
    );
};

const ShopModal = ({ closeModal, showAlert, onPurchase }) => {
    const products = [
        { id: 'prod1', name: "Premium Grain-Free Kibble", price: "3500", image: "https://images.pexels.com/photos/8434685/pexels-photo-8434685.jpeg?auto=compress&cs=tinysrgb&w=400", description: "Nutrient-rich, all-natural food for a healthy coat and happy gut." },
        { id: 'prod2', name: "Durable Chew Toy", price: "800", image: "https://headsupfortails.com/cdn/shop/files/871864006688-7.jpg?v=1709915366&width=1445", description: "Built to last, this toy is perfect for even the most enthusiastic chewers." },
        { id: 'prod3', name: "Reflective Leash & Collar Set", price: "1200", image: "https://images-cdn.ubuy.co.in/64224a3dc619dc1dee4d5d23-reflective-dog-collar-and-leash-set-with.jpg", description: "Stay safe and stylish on your walks, day or night, with this durable set." },
    ];

    return (
       <ServiceModal closeModal={closeModal} title="PawCare Essentials Shop">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-amber-50 rounded-lg p-4 flex flex-col">
                        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4"/>
                        <h3 className="font-bold text-lg text-[#63372C]">{product.name}</h3>
                        <p className="text-gray-600 text-sm flex-grow">{product.description}</p>
                        <div className="flex justify-between items-center mt-4">
                            <p className="font-bold text-xl text-[#8B4513]">₹{parseInt(product.price).toLocaleString('en-IN')}</p>
                            <PeekingButton onClick={() => { onPurchase(product); closeModal(); }} className="bg-[#8B4513] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#63372C] transition-colors text-sm">Buy Now</PeekingButton>
                        </div>
                    </div>
                ))}
            </div>
       </ServiceModal>
    );
};

// --- Chatbot Component ---
function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Welcome! How can I help you today?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (text) => {
        const userMessage = { from: 'user', text };
        let botResponse = { from: 'bot', text: "I can help with the purchase process, available breeds, or connect you to a human. Please choose one of the options!" };

        if (text.toLowerCase().includes('purchase')) {
            botResponse.text = "Our purchase process is simple! Find a dog you like, fill out the inquiry form, and we'll guide you through the rest.";
        } else if (text.toLowerCase().includes('breed')) {
            botResponse.text = "We have a wide variety of breeds! You can see all available dogs on our home page.";
        } else if (text.toLowerCase().includes('contact')) {
            botResponse.text = "You can contact us via the WhatsApp icon on the screen, or call us at 123-456-7890.";
        }
        
        setMessages([...messages, userMessage, botResponse]);
        setInput('');
    };

    const handleButtonClick = (text) => {
        handleSend(text);
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && input.trim() !== '') {
            handleSend(input);
        }
    };

    return (
        <div>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 left-6 w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col z-50">
                    <div className="flex-1 p-4 text-sm overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`my-2 ${msg.from === 'bot' ? 'text-left' : 'text-right'}`}>
                                <p className={`inline-block p-2 rounded-lg ${msg.from === 'bot' ? 'bg-amber-100' : 'bg-blue-100 text-blue-800'}`}>{msg.text}</p>
                            </div>
                        ))}
                        <div className="flex flex-col items-start space-y-2 mt-4">
                            <button onClick={() => handleButtonClick('Purchase process')} className="bg-amber-200 text-amber-800 p-2 rounded-lg text-xs">Purchase process</button>
                            <button onClick={() => handleButtonClick('Available breeds')} className="bg-amber-200 text-amber-800 p-2 rounded-lg text-xs">Available breeds</button>
                            <button onClick={() => handleButtonClick('Contact a human')} className="bg-amber-200 text-amber-800 p-2 rounded-lg text-xs">Contact a human</button>
                        </div>
                    </div>
                    <div className="p-2 border-t">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className="w-full p-2 border rounded-md"
                            value={input}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                </div>
            )}
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 left-6 bg-[#8B4513] text-white p-4 rounded-full shadow-lg hover:bg-[#63372C] transition-transform hover:scale-110 z-50"
                aria-label="Toggle Chat"
            >
                <ChatIcon className="w-8 h-8" />
            </button>
        </div>
    );
}
