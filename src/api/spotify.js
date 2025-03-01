const API_BASE_URL = "https://api.spotify.com/v1/me/top";

/**
 * Fetch top tracks or top artists from Spotify
 * @param {string} token - Spotify API token
 * @param {string} type - "tracks" or "artists"
 * @param {string} timeRange - "short_term", "medium_term", "long_term"
 */
export const fetchSpotifyData = async (token, type = "tracks", timeRange = "long_term") => {
  try {
    const response = await fetch(`${API_BASE_URL}/${type}?limit=50&time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log(`Spotify ${type} Data (${timeRange}):`, data);

    if (!data.items) {
      throw new Error(`Spotify API response does not contain 'items'. Response: ${JSON.stringify(data)}`);
    }

    return data.items.map((item) => {
      if (type === "tracks") {
        return {
          name: item.name,
          artist: item.artists.map((a) => a.name).join(", "), // Convert array to string
          genre: item.album.genres ? item.album.genres[0] : "Unknown", // Albums don't always have genres
          popularity: item.popularity,
          image: item.album.images[1].url,
          spotify_uri: item.uri
        }; //preview_url: item.preview_url || null // Store preview URL if available
      } else if (type === "artists") {
        return {
          name: item.name,
          genre: item.genres.length > 0 ? item.genres[0] : "Unknown", // Artists usually have genres
          popularity: item.popularity,
          image: item.images[1].url
        };
      }
    });
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return [];
  }
};
