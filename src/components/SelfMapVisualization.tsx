import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { clsx } from 'clsx';
import type { IdentityData, ProcessedIdentityData } from '../types/identity';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';

interface SelfMapVisualizationProps {
  data: IdentityData;
  className?: string;
}

export const SelfMapVisualization: React.FC<SelfMapVisualizationProps> = ({ 
  data,
  className 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data || !chartRef.current) {
      setError("No data provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Clear any existing SVG
      d3.select(chartRef.current).selectAll("*").remove();

      // Set up dimensions with responsive sizing
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = Math.min(window.innerHeight * 0.8, 700);
      const margin = { 
        top: containerHeight * 0.086,
        right: containerWidth * 0.178,
        bottom: containerHeight * 0.086,
        left: containerWidth * 0.067
      };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create SVG with responsive dimensions
      const svg = d3.select(chartRef.current)
        .append("svg")
        .attr("width", "100%")
        .attr("height", containerHeight)
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // Enhanced gradient definition
      const defs = svg.append("defs");
      const gradient = defs.append("radialGradient")
        .attr("id", "point-gradient")
        .attr("gradientUnits", "objectBoundingBox")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .attr("fx", "50%")
        .attr("fy", "50%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 0.4);

      gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 0.2);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 0);

      // Create scales with enhanced domains
      const xScale = d3.scaleLinear()
        .domain([-10, 10])
        .range([0, width])
        .nice();

      const yScale = d3.scaleLinear()
        .domain([-10, 10])
        .range([height, 0])
        .nice();

      const colorScale = d3.scaleOrdinal<string>()
        .range([
          '#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea',
          '#0891b2', '#be185d', '#15803d', '#b91c1c', '#7c3aed'
        ]);

      // Enhanced grid with animation
      const makeGrid = () => {
        const gridColor = '#e5e7eb';
        
        // Horizontal grid
        svg.append("g")
          .attr("class", "grid horizontal")
          .attr("transform", `translate(0, ${height/2})`)
          .call(d3.axisBottom(xScale)
            .ticks(10)
            .tickSize(-height)
            .tickFormat('')
          )
          .call(g => g.select(".domain").remove())
          .call(g => g.selectAll(".tick line")
            .attr("stroke", gridColor)
            .attr("stroke-opacity", 0.5)
          );

        // Vertical grid
        svg.append("g")
          .attr("class", "grid vertical")
          .attr("transform", `translate(${width/2}, 0)`)
          .call(d3.axisLeft(yScale)
            .ticks(10)
            .tickSize(-width)
            .tickFormat('')
          )
          .call(g => g.select(".domain").remove())
          .call(g => g.selectAll(".tick line")
            .attr("stroke", gridColor)
            .attr("stroke-opacity", 0.5)
          );
      };

      makeGrid();

      // Enhanced axes with animations
      const xAxis = d3.axisBottom(xScale)
        .tickSize(-5)
        .tickPadding(10)
        .ticks(5);

      const yAxis = d3.axisLeft(yScale)
        .tickSize(-5)
        .tickPadding(10)
        .ticks(5);

      svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height/2})`)
        .call(xAxis)
        .call(g => g.select(".domain").attr("stroke", "#94a3b8"))
        .call(g => g.selectAll(".tick text")
          .attr("fill", "#64748b")
          .style("font-size", "12px")
        );

      svg.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", `translate(${width/2}, 0)`)
        .call(yAxis)
        .call(g => g.select(".domain").attr("stroke", "#94a3b8"))
        .call(g => g.selectAll(".tick text")
          .attr("fill", "#64748b")
          .style("font-size", "12px")
        );

      // Process data with validation
      const processedData: ProcessedIdentityData[] = Object.entries(data)
        .filter(([_, value]) => 
          typeof value === 'object' && 
          value !== null && 
          'Strength' in value &&
          typeof value.Strength === 'number'
        )
        .map(([key, value]) => ({
          name: key,
          strength: value.Strength,
          details: value
        }));

      if (processedData.length === 0) {
        throw new Error("No valid data points found");
      }

      // Add connecting lines group with enhanced styling
      const lineGroup = svg.append("g")
        .attr("class", "connections")
        .style("pointer-events", "none");

      // Position calculation helpers
      const calculatePosition = (value: number, scale: d3.ScaleLinear<number, number>) => {
        if (value === 10) return scale(0);
        if (value >= 5) return scale(value / 2);
        return scale(value);
      };

      const calculateSize = (value: number) => {
        const baseSize = width * 0.008;
        if (value === 10) return baseSize * 1.8;
        if (value >= 5) return baseSize * 1.4;
        return baseSize;
      };

      // Enhanced data points with animations
      const points = svg.selectAll(".dot")
        .data(processedData)
        .enter()
        .append("g")
        .attr("class", "point-group");

      // Glow effect
      points.append("circle")
        .attr("class", "dot-glow")
        .attr("r", d => calculateSize(d.strength) * 2)
        .attr("cx", d => calculatePosition(d.strength, xScale))
        .attr("cy", d => calculatePosition(d.strength, yScale))
        .style("fill", "url(#point-gradient)")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);

      // Main points
      points.append("circle")
        .attr("class", "dot")
        .attr("r", 0)
        .attr("cx", d => calculatePosition(d.strength, xScale))
        .attr("cy", d => calculatePosition(d.strength, yScale))
        .style("fill", d => colorScale(d.name))
        .style("stroke", "white")
        .style("stroke-width", "2px")
        .style("cursor", "pointer")
        .transition()
        .duration(800)
        .attr("r", d => calculateSize(d.strength));

      // Enhanced interactions
      points.selectAll(".dot")
        .on("mouseover", function(event, d) {
          const tooltip = d3.select("body")
            .append("div")
            .attr("class", "fixed bg-gray-900 text-white p-4 rounded-lg shadow-xl pointer-events-none opacity-0 transition-opacity duration-300 text-sm max-w-xs z-50")
            .style("backdrop-filter", "blur(8px)");

          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", calculateSize(d.strength) * 1.2)
            .style("filter", "drop-shadow(0 0 8px rgba(255,255,255,0.5))");

          const centerX = calculatePosition(d.strength, xScale);
          const centerY = calculatePosition(d.strength, yScale);
          
          lineGroup.selectAll(".connection-line")
            .data(processedData.filter(item => item !== d))
            .join("line")
            .attr("class", "connection-line")
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", item => calculatePosition(item.strength, xScale))
            .attr("y2", item => calculatePosition(item.strength, yScale))
            .style("stroke", colorScale(d.name))
            .style("stroke-width", "1.5px")
            .style("stroke-dasharray", "4,4")
            .style("stroke-opacity", 0)
            .transition()
            .duration(300)
            .style("stroke-opacity", 0.3);

          tooltip.transition()
            .duration(200)
            .style("opacity", 1);
          
          tooltip.html(`
            <div class="space-y-2">
              <h3 class="font-bold text-base">${d.name}</h3>
              <div class="space-y-1">
                <p class="text-blue-300">Strength: ${d.strength}/10</p>
                ${d.details.Title ? `<p class="text-gray-300">Role: ${d.details.Title}</p>` : ''}
                ${d.details.Beliefs ? `<p class="text-gray-300">Beliefs: ${d.details.Beliefs}</p>` : ''}
                ${d.details.Style ? `<p class="text-gray-300">Style: ${d.details.Style}</p>` : ''}
              </div>
            </div>
          `)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", calculateSize(d.strength))
            .style("filter", null);

          lineGroup.selectAll(".connection-line")
            .transition()
            .duration(200)
            .style("stroke-opacity", 0)
            .remove();

          d3.selectAll(".fixed").remove();
        });

      // Enhanced legend with interactions
      const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);

      const legendItems = legend.selectAll(".legend-item")
        .data(processedData)
        .enter()
        .append("g")
        .attr("class", "legend-item cursor-pointer")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

      legendItems.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("rx", 4)
        .style("fill", d => colorScale(d.name))
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);

      legendItems.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("fill", "#475569")
        .style("font-size", "12px")
        .style("opacity", 0)
        .text(d => d.name)
        .transition()
        .duration(800)
        .style("opacity", 1);

      // Enhanced title with animation
      const title = svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("fill", "#1e293b")
        .style("opacity", 0)
        .text("Personal Identity Map");

      const subtitle = svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2 + 25)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#64748b")
        .style("opacity", 0)
        .text("Exploring the dimensions of self-identity and personal values");

      title.transition()
        .duration(800)
        .style("opacity", 1);

      subtitle.transition()
        .duration(800)
        .delay(200)
        .style("opacity", 1);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while rendering the visualization");
      setIsLoading(false);
    }
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className={clsx(
      "w-full bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl",
      className
    )}>
      <div 
        ref={chartRef}
        className="w-full"
        style={{ minHeight: '700px' }}
      />
    </div>
  );
};

export default SelfMapVisualization;