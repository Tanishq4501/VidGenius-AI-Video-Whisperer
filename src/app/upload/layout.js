import UploadHeader from "../../components/upload-header";

export default function UploadLayout({ children }) {
  return (
    <div className="upload-layout min-h-screen relative" style={{
      background: 'radial-gradient(1200px 800px at -10% -10%, rgba(99,102,241,0.15), transparent), radial-gradient(1200px 800px at 110% -10%, rgba(168,85,247,0.12), transparent), linear-gradient(180deg, #040128 0%, #0a0733 100%)'
    }}>
      <UploadHeader />
      <main className="upload-main pt-28 pb-16">
        {children}
      </main>
    </div>
  )
} 