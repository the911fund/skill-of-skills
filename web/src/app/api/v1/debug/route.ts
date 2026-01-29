import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection test result:', result)
    
    // Try to count tools (convert BigInt to number)
    const toolCountResult = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM tools` 
    const toolCount = Number(toolCountResult[0]?.count || 0)
    console.log('Tool count:', toolCount)
    
    // Try to list some tools
    const sampleTools = await prisma.$queryRaw<{name: string, repo_url: string}[]>`SELECT name, repo_url FROM tools LIMIT 5`
    console.log('Sample tools:', sampleTools)
    
    return NextResponse.json({
      status: 'success',
      connection: result,
      toolCount,
      sampleTools
    })
  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}