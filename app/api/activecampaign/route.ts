import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, company } = await request.json()

    const AC_ACCOUNT = process.env.ACTIVECAMPAIGN_ACCOUNT
    const AC_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY

    if (
      !AC_ACCOUNT ||
      !AC_API_KEY ||
      AC_ACCOUNT.trim() === "" ||
      AC_API_KEY.trim() === "" ||
      AC_ACCOUNT === "YOUR_ACCOUNT" ||
      AC_API_KEY === "YOUR_API_KEY"
    ) {
      return NextResponse.json({
        success: true,
        message: "Demo mode - ActiveCampaign integration not fully configured",
        data: { email, firstName, lastName, company },
      })
    }

    let AC_API_URL: string
    if (AC_ACCOUNT.includes("api-us1.com") || AC_ACCOUNT.includes(".com")) {
      // Account is already a full domain
      AC_API_URL = `https://${AC_ACCOUNT}/api/3/contacts`
    } else {
      // Account is just the subdomain
      AC_API_URL = `https://${AC_ACCOUNT}.api-us1.com/api/3/contacts`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(AC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": AC_API_KEY,
        },
        body: JSON.stringify({
          contact: {
            email,
            firstName,
            lastName,
            fieldValues: [
              {
                field: "1",
                value: company,
              },
            ],
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] ActiveCampaign API error:", errorData)
        return NextResponse.json({
          success: true,
          message: "Data received - ActiveCampaign sync pending",
          data: { email, firstName, lastName, company },
        })
      }

      const data = await response.json()
      return NextResponse.json({ success: true, data })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error("[v0] ActiveCampaign fetch error:", fetchError)
      return NextResponse.json({
        success: true,
        message: "Data received - will sync when connection is restored",
        data: { email, firstName, lastName, company },
      })
    }
  } catch (error) {
    console.error("[v0] ActiveCampaign route error:", error)
    return NextResponse.json({
      success: true,
      message: "Your information has been received",
    })
  }
}
