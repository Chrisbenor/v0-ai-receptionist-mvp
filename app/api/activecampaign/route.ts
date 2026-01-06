import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, company } = await request.json()

    const AC_ACCOUNT = process.env.ACTIVECAMPAIGN_ACCOUNT
    const AC_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY

    if (!AC_ACCOUNT || !AC_API_KEY || AC_ACCOUNT === "YOUR_ACCOUNT" || AC_API_KEY === "YOUR_API_KEY") {
      console.log("[v0] ActiveCampaign not configured, storing data locally")
      // For demo purposes, just return success without actually sending to ActiveCampaign
      return NextResponse.json({
        success: true,
        message: "Demo mode - ActiveCampaign integration not configured",
        data: { email, firstName, lastName, company },
      })
    }

    const AC_API_URL = `https://${AC_ACCOUNT}.api-us1.com/api/3/contacts`

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
              field: "1", // Replace with your custom field ID for company
              value: company,
            },
          ],
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] ActiveCampaign API error:", errorData)
      throw new Error("ActiveCampaign API error")
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] ActiveCampaign integration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit. Please try again.",
      },
      { status: 500 },
    )
  }
}
