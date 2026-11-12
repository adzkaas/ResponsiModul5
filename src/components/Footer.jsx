import { Mountain } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Mountain size={16} color="#e67e22" />
          <span>SummitGear — Basecamp Logistics &amp; Expedition Inventory</span>
        </div>
        <p className="footer-meta">
          Responsi Modul 5 Praktikum Pemrograman Perangkat Bergerak &bull; S1 Teknik Komputer Undip
        </p>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Abdurrahman Adzka Asy Syauqi (21120124130045) &bull; Kelompok 15
        </p>
      </div>
    </footer>
  )
}
