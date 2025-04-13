import ClientLayout from './clientLayout'

export default async function AudioLayout({
  children,
  params: { videoId }
}: {
  children: React.ReactNode
  params: { videoId: string }
}) {
  return <ClientLayout videoId={videoId}>{children}</ClientLayout>
}
