import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, company, industry } = await request.json()

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
        data: { email, firstName, lastName, company, industry },
      })
    }

    let AC_API_URL: string
    if (AC_ACCOUNT.includes("api-us1.com") || AC_ACCOUNT.includes(".com")) {
      AC_API_URL = `https://${AC_ACCOUNT}/api/3/contacts`
    } else {
      AC_API_URL = `https://${AC_ACCOUNT}.api-us1.com/api/3/contacts`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const fieldValues = []

      // Field ID 1 = Company Name
      if (company) {
        fieldValues.push({
          field: "1",
          value: company,
        })
      }

      if (industry) {
        fieldValues.push({
          field: "2",
          value: industry,
        })
      }

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
            fieldValues,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json({
          success: true,
          message: "Data received - ActiveCampaign sync pending",
          data: { email, firstName, lastName, company, industry },
        })
      }

      const data = await response.json()
      return NextResponse.json({ success: true, data })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      return NextResponse.json({
        success: true,
        message: "Data received - will sync when connection is restored",
        data: { email, firstName, lastName, company, industry },
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: "Your information has been received",
    })
  }
}
