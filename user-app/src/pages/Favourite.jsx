import { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function Favourite() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [favouriteItems, setFavouriteItems] = useState([])

    useEffect(() => {
        if (user) {
            fetchFavouriteItems()
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchFavouriteItems = async () => {
        try {
            const data = await api.getFavourites()
            setFavouriteItems(data || [])
        } catch (error) {
            console.error('Error fetching favourites:', error)
        } finally {
            setLoading(false)
        }
    }

    const removeFromFavourites = async (productId) => {
        try {
            await api.removeFromFavourites(productId)
            setFavouriteItems(prev => prev.filter(item => item.productId !== productId))
        } catch (error) {
            console.error('Error removing from favourites:', error)
        }
    }

    if (!user) {
        return (
            <div className="favourite-page">
                <h2>My Favourites</h2>
                <div className="empty-state">
                    <p>Please sign in to view your favourites</p>
                    <Link to="/login" className="btn btn-primary">Sign In</Link>
                </div>
            </div>
        )
    }

    if (loading) {
        return <div className="loading-container"><p>Loading favourites...</p></div>
    }

    return (
        <div className="favourite-page">
            <h2>My Favourites</h2>
            {favouriteItems.length === 0 ? (
                <div className="empty-state">
                    <p>You don't have any favourite items yet.</p>
                    <Link to="/" className="btn btn-primary">Browse Products</Link>
                </div>
            ) : (
                <div className="favourite-grid">
                    {favouriteItems.map((item) => (
                        <div key={item.productId} className="favourite-card">
                            <button 
                                className="remove-btn"
                                onClick={() => removeFromFavourites(item.productId)}
                                title="Remove from favourites"
                            >
                                ❌
                            </button>
                            {item.productImageUrl && (
                                <img src={item.productImageUrl} alt={item.productName} />
                            )}
                            <div className="favourite-info">
                                <h3>{item.productName}</h3>
                                {item.categoryName && (
                                    <span className="category-tag">{item.categoryName}</span>
                                )}
                                <p className="price">KSH {item.productPrice?.toLocaleString()}</p>
                                <Link to={`/products/${item.productId}`} className="btn">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}