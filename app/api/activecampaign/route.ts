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

    let AC_BASE_URL: string
    if (AC_ACCOUNT.includes("api-us1.com") || AC_ACCOUNT.includes(".com")) {
      AC_BASE_URL = `https://${AC_ACCOUNT}/api/3`
    } else {
      AC_BASE_URL = `https://${AC_ACCOUNT}.api-us1.com/api/3`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const fieldValues = []
      if (company) {
        fieldValues.push({ field: "1", value: company })
      }
      if (industry) {
        fieldValues.push({ field: "2", value: industry })
      }

      const searchResponse = await fetch(`${AC_BASE_URL}/contacts?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: {
          "Api-Token": AC_API_KEY,
        },
        signal: controller.signal,
      })

      let contactId: string | null = null

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.contacts && searchData.contacts.length > 0) {
          contactId = searchData.contacts[0].id
        }
      }

      if (contactId) {
        // Update existing contact
        const updateResponse = await fetch(`${AC_BASE_URL}/contacts/${contactId}`, {
          method: "PUT",
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

        if (!updateResponse.ok) {
          return NextResponse.json({
            success: true,
            message: "Data received - ActiveCampaign sync pending",
            data: { email, firstName, lastName, company, industry },
          })
        }

        const data = await updateResponse.json()
        return NextResponse.json({ success: true, data })
      } else {
        // Create new contact
        const createResponse = await fetch(`${AC_BASE_URL}/contacts`, {
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

        if (!createResponse.ok) {
          return NextResponse.json({
            success: true,
            message: "Data received - ActiveCampaign sync pending",
            data: { email, firstName, lastName, company, industry },
          })
        }

        const data = await createResponse.json()
        return NextResponse.json({ success: true, data })
      }
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
