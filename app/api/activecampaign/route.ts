import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, company } = await request.json()

    // TODO: Replace with your actual ActiveCampaign credentials
    const AC_ACCOUNT = process.env.ACTIVECAMPAIGN_ACCOUNT || "YOUR_ACCOUNT"
    const AC_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY || "YOUR_API_KEY"
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
      throw new Error("ActiveCampaign API error")
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] ActiveCampaign integration error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit" }, { status: 500 })
  }
}
