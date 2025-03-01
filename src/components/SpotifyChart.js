import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./SpotifyChart.css"; // Import the CSS file

const SpotifyChart = ({ data,type ,token,deviceId}) => {
  console.log("🎯 deviceId in SpotifyChart:", deviceId); // Debugging
    const chartRef = useRef();
  const [selectedSong, setSelectedSong] = useState(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false); // Track panel state




  const handleTogglePlayPause = async () => {
    if (!deviceId) {
      alert("⚠️ Spotify Web Player not ready yet!");
      return;
    }
  
    try {
      const url = isPlaying 
        ? "https://api.spotify.com/v1/me/player/pause" 
        : "https://api.spotify.com/v1/me/player/play";
  
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
  
      if (response.ok) {
        setIsPlaying(!isPlaying);
      } else {
        console.error("❌ Error toggling playback:", await response.json());
      }
    } catch (error) {
      console.error("❌ Network error:", error);
    }
  };
  
  const handleNextTrack = async () => {
    try {
      await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (error) {
      console.error("❌ Error skipping track:", error);
    }
  };
  
  const handlePreviousTrack = async () => {
    try {
      await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (error) {
      console.error("❌ Error going back to previous track:", error);
    }
  };
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;
   
    const { width, height } = dimensions;
    const svg = d3.select(chartRef.current)
      .attr("width","100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`) // Ensures proper scaling
      .attr("preserveAspectRatio", "xMidYMid meet") // Ensures centering inside container
  .style("display", "block") // Removes unwanted spacing
  .style("margin", "auto"); // Ensures proper centering
      //.style("background", "#f8f9fa");
    svg.selectAll("*").remove(); // Clear previous SVG elements

    const radiusScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.popularity)])
      .range([10, Math.min(width, height) / 10]); // Adjust size based on screen

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
const genres = [...new Set(data.map(d => d.genre))]; // Get unique genres

const genreScale = d3.scalePoint()
  .domain(genres)
  .range([100, width - 100]) // Space out groups
  .padding(1);
// Update when clicking a bubble
const handleBubbleClick = (event, d) => {
  setSelectedItem(d);
  setIsPanelOpen(true); // Open side panel
};
const tooltip = d3.select("body").append("div") 
  .attr("class", "tooltip") 
  .style("position", "absolute")
  .style("background", "#222")
  .style("color", "white")
  .style("padding", "8px")
  .style("border-radius", "5px")
  .style("opacity", 0)
  .style("pointer-events", "none");
// Close button should reset it
const closePanel = () => {
  setIsPanelOpen(false);
  setSelectedItem(null);
};
 
  const simulation = d3.forceSimulation(data)
  .force("x", d3.forceX(width / 2).strength(0.2)) // Adjust centering
  .force("y", d3.forceY(height / 2).strength(0.2)) // Adjust centering
  .force("charge", d3.forceManyBody().strength(5))
  .force("collision", d3.forceCollide(d => radiusScale(d.popularity) + 3))
  .alpha(1)
  .alphaDecay(0.05);

  simulation.nodes(data).on("tick", () => {
    bubbles.attr("transform", d => {
      d.x = Math.max(radiusScale(d.popularity), Math.min(width - radiusScale(d.popularity), d.x)); 
      d.y = Math.max(radiusScale(d.popularity), Math.min(height - radiusScale(d.popularity), d.y));
      return `translate(${d.x}, ${d.y})`;
    });
  });
    const bubbles = svg.selectAll(".bubble")
      .data(data)
      .enter()
      .append("g")
      .attr("class","bubble")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .attr("r", d => radiusScale(d.popularity))
      .attr("fill", d => colorScale(type === "tracks" ? d.artist : d.name)) // Color by artist (tracks) or name (artists)
      .attr("stroke", "black")
      .attr("opacity", 0.8)
      .on("mouseover", (event,d) => {
       console.log(d)                                                   
        d3.select(this).attr("stroke-width", 3);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>${d.name}</strong><br>
          Artist: ${d.artist}<br>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
        
        d3.select(this).attr("stroke-width", 3).attr("opacity", 1);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
  d3.select(this).attr("stroke-width", 1).attr("opacity", 0.8);
      })
      .on("click", (event, d) => {
        setSelectedSong(d);
        setSelectedItem(d)
        console.log(d)
        console.log(deviceId) // Update selected song details
        if (!deviceId) {
            alert("Spotify Web Player not ready yet!");
            return;
          }



        
          const playTrack = async (spotifyUri) => {
            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
              method: "PUT",
              body: JSON.stringify({ uris: [spotifyUri] }),
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            });
          };
        
          playTrack(d.spotify_uri);
        });

        // Background Circle (For Styling)
        bubbles.append("circle")
        .attr("r", d => radiusScale(d.popularity))
        .attr("fill", "#1db954") // You can change this color if needed
        .attr("stroke", "white")
        .attr("stroke-width", 2)
    
        // Clip Path to Ensure Circular Images
        bubbles.append("clipPath")
        .attr("id", (d, i) => `clip-${i}`)
        .append("circle")
        .attr("r", d => radiusScale(d.popularity));
        
        // Add Album Cover Image Inside Circle
        bubbles.append("image")
        .attr("xlink:href", d => d.image) // Make sure your data includes 'image' (album cover)
        .attr("width", d => radiusScale(d.popularity) * 2)
        .attr("height", d => radiusScale(d.popularity) * 2)
        .attr("x", d => -radiusScale(d.popularity)) // Center the image inside the circle
        .attr("y", d => -radiusScale(d.popularity))
        .attr("clip-path", (d, i) => `url(#clip-${i})`); // Apply clipping to ensure circular shape
      
  }, [data,type, dimensions,token,deviceId]);

 
return (
  <div className="container">
   <div className={`chart-container ${isPanelOpen ? "contracted" : ""}`}>
      <svg ref={chartRef}></svg>
      </div>
      <div className="side-panel-container">
      {selectedItem && (
        <div className={`side-panel ${selectedItem ? "active" : ""}`}>
          <h2>{selectedItem.name}</h2>
          
          {selectedItem.image && <img src={selectedItem.image} alt={selectedItem.name} />} 
          
          {type === "tracks" ? (
            <>
              <p><strong>Artist:</strong> {selectedItem.artist}</p>
              <p><strong>Genre:</strong> {selectedItem.genre}</p>
              <p><strong>Popularity:</strong> {selectedItem.popularity}</p>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {selectedItem.artist}</p>
              <p><strong>Popularity:</strong> {selectedItem.popularity}</p>
            </>
          )}
          {/* PLAYER CONTROLS */}
        <div className="player-controls">
          <button onClick={handlePreviousTrack}>⏮️</button>
          <button onClick={handleTogglePlayPause}>{isPlaying ? "⏸️" : "▶️"}</button>
          <button onClick={handleNextTrack}>⏭️</button>
          </div>
          <button onClick={() => setSelectedItem(null)}>Close</button>
      </div>
      )}
      </div>
      
      </div>
      
)
}
    

export default SpotifyChart;
