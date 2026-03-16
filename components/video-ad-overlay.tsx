"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"

export interface VideoAdOverlayProps {
  /** Delay in milliseconds before the ad overlay appears. Defaults to 10000 (10 seconds). */
  delay?: number
}

export function VideoAdOverlay({ delay = 10000 }: VideoAdOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [adLoaded, setAdLoaded] = useState(false)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const scriptInjectedRef = useRef(false)

  // Show the overlay after the specified delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  // Inject the ad script into the container once the overlay is visible
  useEffect(() => {
    if (!isVisible || scriptInjectedRef.current || !adContainerRef.current) return

    scriptInjectedRef.current = true

    const container = adContainerRef.current

    // Auto-hide timeout: if ad doesn't load within 5 seconds, hide the overlay
    const autoHideTimer = setTimeout(() => {
      if (!adLoaded) {
        setIsVisible(false)
        scriptInjectedRef.current = false
      }
    }, 5000)

    // Set atOptions on the window object for the external script
    const optionsScript = document.createElement("script")
    optionsScript.type = "text/javascript"
    optionsScript.text = `
      window.atOptions = {
        'key' : '9a79b03acf3a8b5ceea040142b3904da',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `
    container.appendChild(optionsScript)

    // Load the external Adsterra script
    const externalScript = document.createElement("script")
    externalScript.type = "text/javascript"
    externalScript.src =
      "https://www.highperformanceformat.com/9a79b03acf3a8b5ceea040142b3904da/invoke.js"
    
    externalScript.onload = () => {
      // Check if an iframe was actually created (ad loaded successfully)
      setTimeout(() => {
        const iframe = container.querySelector("iframe")
        if (iframe) {
          setAdLoaded(true)
        } else {
          // No iframe means ad blocked or failed
          setIsVisible(false)
          scriptInjectedRef.current = false
        }
      }, 1000)
    }
    
    externalScript.onerror = () => {
      // Ad script failed to load — hide overlay immediately
      setIsVisible(false)
      scriptInjectedRef.current = false
    }
    container.appendChild(externalScript)

    return () => clearTimeout(autoHideTimer)
  }, [isVisible, adLoaded])

  const handleClose = useCallback(() => {
    setIsVisible(false)

    // Clean up injected scripts when closing
    if (adContainerRef.current) {
      while (adContainerRef.current.firstChild) {
        adContainerRef.current.removeChild(adContainerRef.current.firstChild)
      }
    }
    scriptInjectedRef.current = false
  }, [])

  // Don't render the blocking overlay until we know the ad actually loaded
  // The ad container is rendered hidden first to inject scripts
  return (
    <>
      {/* Hidden container for script injection */}
      <div
        ref={adContainerRef}
        className={isVisible && !adLoaded ? "absolute opacity-0 pointer-events-none" : "hidden"}
      />

      {/* Only show the blocking overlay once the ad has loaded successfully */}
      {isVisible && adLoaded && (
        <div
          className="absolute inset-0 z-[150] flex items-center justify-center bg-black/60"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative rounded-lg bg-black/90 p-4 shadow-lg">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-2 -right-2 z-10 rounded-full bg-white/20 p-1 transition-colors hover:bg-white/40"
              aria-label="Close ad"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Move the ad iframe here once loaded */}
            <div className="min-h-[250px] min-w-[300px] flex items-center justify-center">
              {adContainerRef.current?.innerHTML && (
                <div dangerouslySetInnerHTML={{ __html: adContainerRef.current.innerHTML }} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
