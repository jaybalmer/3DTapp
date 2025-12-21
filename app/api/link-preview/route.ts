import { NextResponse } from "next/server"

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
}

/**
 * Fetches link preview metadata (Open Graph, Twitter Cards, etc.)
 * This is a server-side API route to avoid CORS issues
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // Validate URL
    let targetUrl = url
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl
    }

    new URL(targetUrl) // Validate URL format

    // Fetch the HTML
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      // Timeout after 10 seconds (Instagram can be slow)
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    })

    if (!response.ok) {
      // For Instagram and other social media, return basic info even if fetch fails
      if (targetUrl.includes("instagram.com")) {
        // Extract post type from URL
        let postType = "Post"
        if (targetUrl.includes("/reel/")) {
          postType = "Reel"
        } else if (targetUrl.includes("/p/")) {
          postType = "Post"
        } else if (targetUrl.includes("/tv/")) {
          postType = "IGTV"
        }
        
        return NextResponse.json({
          url: targetUrl,
          title: `Instagram ${postType}`,
          siteName: "Instagram",
          description: `View this ${postType.toLowerCase()} on Instagram`,
        })
      }
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: response.status }
      )
    }

    const html = await response.text()
    
    // Handle Instagram's client-side rendered content
    // Instagram often returns a login page or minimal HTML, so we check for that
    if (targetUrl.includes("instagram.com")) {
      // Check if we got a login page (Instagram blocks automated access)
      const hasLoginPage = html.includes("Log in") || html.includes("login") || html.includes("Instagram") && !html.includes("og:title")
      const hasOGTags = html.includes("og:title") || html.includes("og:image")
      
      if (hasLoginPage || !hasOGTags) {
        // Likely got a login page or minimal content, return fallback
        let postType = "Post"
        if (targetUrl.includes("/reel/")) {
          postType = "Reel"
        } else if (targetUrl.includes("/p/")) {
          postType = "Post"
        } else if (targetUrl.includes("/tv/")) {
          postType = "IGTV"
        }
        
        return NextResponse.json({
          url: targetUrl,
          title: `Instagram ${postType}`,
          siteName: "Instagram",
          description: `View this ${postType.toLowerCase()} on Instagram`,
        })
      }
      // Has OG tags, continue with normal extraction
    }

    // Extract metadata using regex (simple approach)
    const preview: LinkPreview = { url: targetUrl }

    // Open Graph tags
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    const ogDescriptionMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    const ogSiteNameMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i)

    // Twitter Card tags (fallback)
    const twitterTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i)
    const twitterDescriptionMatch = html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i)
    const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i)

    // Standard meta tags (fallback)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)

    // Extract values with fallbacks
    preview.title =
      ogTitleMatch?.[1] || twitterTitleMatch?.[1] || titleMatch?.[1] || undefined
    preview.description =
      ogDescriptionMatch?.[1] ||
      twitterDescriptionMatch?.[1] ||
      descriptionMatch?.[1] ||
      undefined
    preview.image = ogImageMatch?.[1] || twitterImageMatch?.[1] || undefined
    preview.siteName = ogSiteNameMatch?.[1] || undefined

    // Clean up extracted text (remove HTML entities, trim)
    if (preview.title) {
      preview.title = preview.title
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim()
    }

    if (preview.description) {
      preview.description = preview.description
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim()
    }

    // Make image URL absolute if it's relative
    if (preview.image && !preview.image.startsWith("http")) {
      try {
        const baseUrl = new URL(targetUrl)
        preview.image = new URL(preview.image, baseUrl.origin).href
      } catch {
        // If URL construction fails, keep original
      }
    }

    return NextResponse.json(preview)
  } catch (error: any) {
    console.error("Error fetching link preview:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch link preview" },
      { status: 500 }
    )
  }
}

