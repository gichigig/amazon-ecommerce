import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Favourite() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const[loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchCartItems()

        }
    }, [user])

    const fetchFavouriteItems = async () => {
        try {
            const {data, error  } = await supabase
            .from('favourite_items')
            .select('
                *,
                products (
                    id,
                    name,
                    price,image_url
                )
                ')
                .eq('user_id, user.id')

                if(error) throw error
                setFavouriteItems(data || [])

        } finally {
            serLoading(false)
        }
    }

    if (loading) {
        return <div className="loading-container"><p>Loading Favourite....</p></div>
    }

    return (
        <div classname="favourite-page">
            <h2>Favourite page </h2>
            {favouriteItems.length ===0 ? (
                <p> you don't have a favourite item for now, select a fav and come latter. Thank you</p>
            ) : (
                <>
                <div className="favourite-items"></div>
                </>
            )}
        </div>
    )
}