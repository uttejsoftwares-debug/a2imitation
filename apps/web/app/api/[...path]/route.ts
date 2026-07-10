import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || process.env.API_INTERNAL_URL || 'https://a2imitation-api.onrender.com';

async function proxyRequest(request: NextRequest, pathSegments: string[] = []) {
  const requestUrl = new URL(request.url);
  const targetPath = pathSegments.length ? `/api/${pathSegments.join('/')}` : '/api';
  const targetUrl = new URL(`${API_BASE}${targetPath}${requestUrl.search}`);

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('x-forwarded-host');
  headers.delete('x-forwarded-proto');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.text();
  }

  const response = await fetch(targetUrl, init);
  const responseBody = await response.text();
  const nextResponse = new NextResponse(responseBody, {
    status: response.status,
    headers: response.headers,
  });

  return nextResponse;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path ?? []);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path ?? []);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path ?? []);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path ?? []);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path ?? []);
}

export async function OPTIONS(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path ?? []);
}
