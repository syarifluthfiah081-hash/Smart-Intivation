var e=e=>{if(!e)return``;let t=new Date(e);return isNaN(t.getTime())?e:`${t.getDate()} ${[`Januari`,`Februari`,`Maret`,`April`,`Mei`,`Juni`,`Juli`,`Agustus`,`September`,`Oktober`,`November`,`Desember`][t.getMonth()]} ${t.getFullYear()}`},t=[{id:`izin-guru`,name:`Surat Izin Guru / Staf`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`800/015/SMKN2-TIKEP/2026`,defaultValue:`800/015/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_guru`,label:`Nama Lengkap Guru`,type:`text`,placeholder:`Muhammad Rizal, S.Pd.`,defaultValue:`Muhammad Rizal, S.Pd.`},{key:`nip_guru`,label:`NIP / NUPTK`,type:`text`,placeholder:`198503122010011015`,defaultValue:`198503122010011015`},{key:`pangkat_golongan`,label:`Pangkat / Golongan`,type:`text`,placeholder:`Penata Tk. I, III/d`,defaultValue:`Penata Tk. I, III/d`},{key:`jabatan_mapel`,label:`Jabatan / Mata Pelajaran`,type:`text`,placeholder:`Guru Teknik Komputer dan Jaringan`,defaultValue:`Guru Teknik Komputer dan Jaringan`},{key:`alasan_izin`,label:`Alasan Izin / Keperluan`,type:`textarea`,placeholder:`Keperluan keluarga penting / Pemeriksaan kesehatan / Tugas kedinasan...`,defaultValue:`Menghadiri acara keluarga dan pemeriksaan kesehatan berkala yang tidak dapat ditinggalkan.`},{key:`durasi_izin`,label:`Jangka Waktu / Tanggal Izin`,type:`text`,placeholder:`2 (dua) hari, 02 s.d 03 September 2026`,defaultValue:`2 (dua) hari, 02 s.d 03 September 2026`},{key:`tugas_pengganti`,label:`Penyerahan Tugas / Guru Pengganti`,type:`text`,placeholder:`Materi dan modul ajar dititipkan kepada Guru Piket / Bpk. Salim`,defaultValue:`Materi dan lembar tugas mandiri telah dititipkan kepada Guru Piket.`}],generatePreviewHtml:(e,t)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-5">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT KETERANGAN IZIN</h4>
          <p class="text-[11px] leading-none mt-1">Nomor: ${e.nomor||`-`}</p>
        </div>

        <div class="mb-3 text-justify">
          <p class="indent-8">Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>${t.schoolName}</strong>, dengan ini memberikan izin kepada:</p>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-40 py-0.5">Nama Lengkap</td><td>: <strong>${e.nama_guru||`-`}</strong></td></tr>
            <tr><td class="py-0.5">NIP / NUPTK</td><td>: ${e.nip_guru||`-`}</td></tr>
            <tr><td class="py-0.5">Pangkat / Golongan</td><td>: ${e.pangkat_golongan||`-`}</td></tr>
            <tr><td class="py-0.5">Jabatan / Mapel</td><td>: ${e.jabatan_mapel||`-`}</td></tr>
            <tr><td class="py-0.5">Unit Kerja</td><td>: ${t.schoolName}</td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p>Untuk tidak melaksanakan tugas / izin meninggalkan dinas dengan rincian sebagai berikut:</p>
          <div class="border border-black p-3 bg-slate-50 mt-1.5 print:bg-transparent">
            <p><strong>Alasan Izin:</strong><br/>${e.alasan_izin||`-`}</p>
            <p class="mt-2"><strong>Waktu / Durasi:</strong> ${e.durasi_izin||`-`}</p>
            <p class="mt-1"><strong>Tugas Pembelajaran:</strong> ${e.tugas_pengganti||`-`}</p>
          </div>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Demikian surat izin ini diberikan untuk dapat dipergunakan sebagaimana mestinya, dan setelah masa izin selesai yang bersangkutan diwajibkan untuk kembali melaksanakan tugas kedinasan seperti biasa.</p>
        </div>
      </div>
    `},{id:`panggilan-siswa`,name:`Surat Panggilan Orang Tua / Siswa`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`421.5/088/SMKN2-TIKEP/2026`,defaultValue:`421.5/088/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`lampiran`,label:`Lampiran`,type:`text`,placeholder:`-`,defaultValue:`-`},{key:`sifat`,label:`Sifat Surat`,type:`select`,options:[`Penting`,`Sangat Penting`,`Biasa`],defaultValue:`Penting`},{key:`nama_ortu`,label:`Nama Orang Tua / Wali`,type:`text`,placeholder:`Bapak/Ibu Orang Tua / Wali dari Siswa`,defaultValue:`Bapak/Ibu Orang Tua / Wali dari Siswa`},{key:`nama_siswa`,label:`Nama Siswa`,type:`text`,placeholder:`Fahri Hidayat`,defaultValue:`Fahri Hidayat`},{key:`kelas_jurusan`,label:`Kelas / Kompetensi Keahlian`,type:`text`,placeholder:`XI TKJ 1 (Teknik Komputer & Jaringan)`,defaultValue:`XI TKJ 1 (Teknik Komputer & Jaringan)`},{key:`hari_tanggal`,label:`Hari, Tanggal Panggilan`,type:`text`,placeholder:`Kamis, 04 September 2026`,defaultValue:`Kamis, 04 September 2026`},{key:`waktu`,label:`Waktu / Pukul`,type:`text`,placeholder:`09.00 WIT s.d Selesai`,defaultValue:`09.00 WIT s.d Selesai`},{key:`tempat`,label:`Tempat Panggilan`,type:`text`,placeholder:`Ruang Bimbingan & Konseling (BK) / Kepala Sekolah SMKN 2 Tikep`,defaultValue:`Ruang Bimbingan & Konseling (BK) SMKN 2 Kota Tidore Kepulauan`},{key:`menemui`,label:`Menemui Siapa`,type:`text`,placeholder:`Guru BP/BK / Wali Kelas / Kepala Sekolah`,defaultValue:`Koordinator BK & Wali Kelas`},{key:`keperluan`,label:`Maksud / Keperluan`,type:`textarea`,placeholder:`Konsultasi dan pembinaan terkait kedisiplinan dan kehadiran siswa di sekolah...`,defaultValue:`Konsultasi perkembangan belajar serta pembinaan kedisiplinan dan presensi kehadiran siswa di sekolah.`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="flex justify-between mb-4">
          <div>
            <table>
              <tr><td class="w-20 py-0.5">Nomor</td><td>: ${t.nomor||`-`}</td></tr>
              <tr><td class="py-0.5">Sifat</td><td>: ${t.sifat||`Penting`}</td></tr>
              <tr><td class="py-0.5">Lampiran</td><td>: ${t.lampiran||`-`}</td></tr>
              <tr><td class="py-0.5">Perihal</td><td>: <strong>Panggilan Orang Tua / Wali Siswa</strong></td></tr>
            </table>
          </div>
          <div class="text-right">
            Tidore, ${e(t.tanggal_surat)}
          </div>
        </div>

        <div class="mb-4">
          <p>Kepada Yth.<br/>
          <strong>${t.nama_ortu||`-`}</strong><br/>
          Orang Tua / Wali dari: <strong>${t.nama_siswa||`-`}</strong> (${t.kelas_jurusan||`-`})<br/>
          di Tempat</p>
        </div>

        <div class="mb-4 text-justify">
          <p>Dengan hormat,</p>
          <p class="indent-8 mt-1">Sehubungan dengan perlunya koordinasi dan pembinaan terpadu terhadap perkembangan pendidikan putra/putri Bapak/Ibu di <strong>${n.schoolName}</strong>, maka dengan ini kami mengharap kehadiran Bapak/Ibu pada:</p>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-36 py-0.5">Hari / Tanggal</td><td>: <strong>${t.hari_tanggal||`-`}</strong></td></tr>
            <tr><td class="py-0.5">Waktu</td><td>: ${t.waktu||`-`}</td></tr>
            <tr><td class="py-0.5">Tempat</td><td>: ${t.tempat||`-`}</td></tr>
            <tr><td class="py-0.5">Menghadap</td><td>: ${t.menemui||`-`}</td></tr>
            <tr><td class="py-0.5">Keperluan</td><td>: ${t.keperluan||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Mengingat pentingnya agenda pembinaan ini bagi kelancaran proses belajar siswa, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan tanpa diwakilkan.</p>
          <p class="mt-2">Demikian surat panggilan ini kami sampaikan, atas perhatian dan kerja sama yang baik diucapkan terima kasih.</p>
        </div>
      </div>
    `},{id:`surat-pernyataan`,name:`Surat Pernyataan Siswa / Guru`,fields:[{key:`judul_surat`,label:`Judul Dokumen Pernyataan`,type:`text`,placeholder:`SURAT PERNYATAAN TATA TERTIB SISWA`,defaultValue:`SURAT PERNYATAAN SISWA`},{key:`nomor`,label:`Nomor Registrasi (Opsional)`,type:`text`,placeholder:`421.5/092/SMKN2-TIKEP/2026`,defaultValue:`421.5/092/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Pernyataan`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_pihak`,label:`Nama Lengkap Yang Menyatakan`,type:`text`,placeholder:`Fahri Hidayat`,defaultValue:`Fahri Hidayat`},{key:`identitas_nomor`,label:`NIS / NISN / NIP`,type:`text`,placeholder:`NISN: 0078129033`,defaultValue:`NISN: 0078129033`},{key:`kelas_posisi`,label:`Kelas / Kompetensi / Jabatan`,type:`text`,placeholder:`Kelas X Teknik Otomotif 2`,defaultValue:`Kelas X Teknik Otomotif 2`},{key:`alamat_pihak`,label:`Alamat Tinggal`,type:`text`,placeholder:`Kelurahan Tomalou, Tidore Selatan`,defaultValue:`Kelurahan Tomalou, Tidore Selatan`},{key:`isi_pernyataan`,label:`Poin-Poin Pernyataan`,type:`textarea`,placeholder:`1. Sanggup mematuhi tata tertib sekolah...
2. Tidak mengulangi perbuatan melanggar kedisiplinan...
3. Siap menerima sanksi apabila melanggar...`,defaultValue:`1. Bersedia mematuhi seluruh tata tertib dan peraturan yang berlaku di SMK Negeri 2 Kota Tidore Kepulauan.
2. Sanggup mengikuti seluruh kegiatan belajar mengajar, praktik kejuruan, dan kegiatan ekstrakurikuler dengan penuh disiplin.
3. Tidak akan terlibat dalam tawuran, perundungan (bullying), penggunaan obat terlarang/narkoba, maupun tindakan asusila.
4. Apabila di kemudian hari saya melanggar pernyataan ini, maka saya bersedia menerima sanksi yang ditetapkan sekolah hingga sanksi dikembalikan kepada orang tua.`},{key:`nama_saksi_ortu`,label:`Nama Orang Tua / Saksi`,type:`text`,placeholder:`Nama Orang Tua / Wali`,defaultValue:`Orang Tua / Wali Siswa`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-5">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">${t.judul_surat||`SURAT PERNYATAAN`}</h4>
          ${t.nomor?`<p class="text-[11px] leading-none mt-1">Nomor: ${t.nomor}</p>`:``}
        </div>

        <div class="mb-3 text-justify">
          <p class="indent-8">Yang bertanda tangan di bawah ini:</p>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-36 py-0.5">Nama Lengkap</td><td>: <strong>${t.nama_pihak||`-`}</strong></td></tr>
            <tr><td class="py-0.5">Nomor Identitas</td><td>: ${t.identitas_nomor||`-`}</td></tr>
            <tr><td class="py-0.5">Kelas / Jabatan</td><td>: ${t.kelas_posisi||`-`}</td></tr>
            <tr><td class="py-0.5">Alamat</td><td>: ${t.alamat_pihak||`-`}</td></tr>
            <tr><td class="py-0.5">Sekolah</td><td>: ${n.schoolName}</td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8">Dengan ini menyatakan dengan sebenar-benarnya dan dengan penuh kesadaran tanpa ada paksaan dari pihak mana pun bahwa:</p>
          <div class="border border-black p-3 bg-slate-50 mt-2 print:bg-transparent whitespace-pre-line text-justify leading-relaxed">
${t.isi_pernyataan||`-`}
          </div>
        </div>

        <div class="mb-6 text-justify">
          <p class="indent-8">Demikian surat pernyataan ini saya buat dengan sesungguhnya untuk dapat dipertanggungjawabkan dan dipergunakan sebagaimana mestinya.</p>
        </div>

        <div class="flex justify-between items-start text-center mt-6 pt-2 avoid-break">
          <div class="w-[180px]">
            <p>Mengetahui,<br/>${t.nama_saksi_ortu||`Orang Tua / Wali`}</p>
            <div class="h-[60px]"></div>
            <p class="font-bold underline">( ............................................ )</p>
          </div>
          <div class="w-[200px]">
            <p>Tidore, ${e(t.tanggal_surat)}<br/>Yang Membuat Pernyataan,</p>
            <div class="h-[15px]"></div>
            <span class="text-[9px] text-slate-400 block no-print">[ Materai Rp 10.000 ]</span>
            <div class="h-[35px]"></div>
            <p class="font-bold underline">${t.nama_pihak||`-`}</p>
          </div>
        </div>
      </div>
    `},{id:`surat-permohonan`,name:`Surat Permohonan / Kerjasama / Bantuan`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`421.3/044/SMKN2-TIKEP/2026`,defaultValue:`421.3/044/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`lampiran`,label:`Lampiran`,type:`text`,placeholder:`1 (satu) Berkas Proposal`,defaultValue:`1 (satu) Berkas Proposal`},{key:`perihal`,label:`Perihal Permohonan`,type:`text`,placeholder:`Permohonan Tempat Praktik Kerja Lapangan (PKL) Siswa`,defaultValue:`Permohonan Tempat Praktik Kerja Lapangan (PKL) Siswa`},{key:`penerima_tujuan`,label:`Penerima Surat (Instansi / DUDI)`,type:`text`,placeholder:`Pimpinan PT / Kantor Telkom Cabang Tidore`,defaultValue:`Pimpinan PT. Telkom Indonesia Wilayah Tidore`},{key:`alamat_tujuan`,label:`Kota / Lokasi Tujuan`,type:`text`,placeholder:`Kota Tidore Kepulauan`,defaultValue:`Kota Tidore Kepulauan`},{key:`isi_permohonan`,label:`Isi Ringkasan Permohonan`,type:`textarea`,placeholder:`Dalam rangka meningkatkan kompetensi kejuruan dan menyelaraskan kurikulum SMK dengan dunia industri (DUDI), kami memohon kesediaan...`,defaultValue:`Dalam rangka pelaksanaan program kurikulum vokasi serta membekali peserta didik dengan pengalaman nyata dunia industri (DUDI), kami bermaksud mengajukan permohonan penempatan Praktik Kerja Lapangan (PKL) bagi siswa-siswi SMK Negeri 2 Kota Tidore Kepulauan.`},{key:`detail_kegiatan`,label:`Rincian Kegiatan / Waktu / Jumlah Siswa`,type:`text`,placeholder:`Jurusan TKJ & Otomotif, Periode: Oktober - Desember 2026 (Jumlah: 6 Siswa)`,defaultValue:`Kompetensi Keahlian TKJ & TBSM, Periode: Oktober s.d Desember 2026 (Jumlah: 8 Siswa)`},{key:`narahubung`,label:`Narahubung / Kontak Panitia (Hubin)`,type:`text`,placeholder:`Ketua Pokja PKL: 0812-XXXX-XXXX (Bpk. Ahmad)`,defaultValue:`Ketua Pokja PKL / Hubungan Industri (HP/WA: 0812-4455-6677)`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="flex justify-between mb-4">
          <div>
            <table>
              <tr><td class="w-20 py-0.5">Nomor</td><td>: ${t.nomor||`-`}</td></tr>
              <tr><td class="py-0.5">Lampiran</td><td>: ${t.lampiran||`-`}</td></tr>
              <tr><td class="py-0.5">Perihal</td><td>: <strong>${t.perihal||`Permohonan`}</strong></td></tr>
            </table>
          </div>
          <div class="text-right">
            Tidore, ${e(t.tanggal_surat)}
          </div>
        </div>

        <div class="mb-4">
          <p>Kepada Yth.<br/>
          <strong>${t.penerima_tujuan||`-`}</strong><br/>
          di<br/>
          ${t.alamat_tujuan||`Tempat`}</p>
        </div>

        <div class="mb-4 text-justify">
          <p>Dengan hormat,</p>
          <p class="indent-8 mt-1">${t.isi_permohonan||`-`}</p>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-36 py-0.5">Rincian / Waktu</td><td>: <strong>${t.detail_kegiatan||`-`}</strong></td></tr>
            <tr><td class="py-0.5">Instansi Pengirim</td><td>: ${n.schoolName}</td></tr>
            <tr><td class="py-0.5">Kontak Panitia</td><td>: ${t.narahubung||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Besar harapan kami agar Bapak/Ibu dapat berkenan menerima dan menjalin sinergi kemitraan bersama institusi pendidikan kami demi kemajuan vokasi generasi penerus.</p>
          <p class="mt-2">Demikian surat permohonan ini kami sampaikan. Atas perhatian, perkenan, dan kerja sama yang baik dari Bapak/Ibu, kami ucapkan terima kasih.</p>
        </div>
      </div>
    `},{id:`disposisi-surat`,name:`Lembar Disposisi Surat Kepala Sekolah`,fields:[{key:`nomor_agenda`,label:`Nomor Agenda Surat Masuk`,type:`text`,placeholder:`AGD/2026/089`,defaultValue:`AGD/2026/089`},{key:`tanggal_diterima`,label:`Tanggal Surat Diterima`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`surat_dari`,label:`Asal Surat (Pengirim)`,type:`text`,placeholder:`Dinas Pendidikan & Kebudayaan Provinsi Maluku Utara`,defaultValue:`Dinas Pendidikan & Kebudayaan Provinsi Maluku Utara`},{key:`nomor_surat_masuk`,label:`Nomor Surat Masuk`,type:`text`,placeholder:`421/782/DISDIKBUD-MU/2026`,defaultValue:`421/782/DISDIKBUD-MU/2026`},{key:`tanggal_surat_masuk`,label:`Tanggal Surat Masuk`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`sifat`,label:`Sifat Dokumen`,type:`select`,options:[`Sangat Segera`,`Segera / Penting`,`Rahasia`,`Biasa`],defaultValue:`Segera / Penting`},{key:`perihal_isi`,label:`Perihal / Ringkasan Isi Surat`,type:`textarea`,placeholder:`Pelaksanaan Monitoring dan Evaluasi Bantuan Operasional Sekolah (BOS) Tahap II...`,defaultValue:`Pelaksanaan Monitoring dan Evaluasi Bantuan Operasional Sekolah (BOS) Tahap II serta Pemutakhiran Data Sarana Prasarana Vokasi.`},{key:`diteruskan_kepada`,label:`Diteruskan Kepada (Pejabat/Staf)`,type:`text`,placeholder:`1. Wakasek Kurikulum  2. Kepala Tata Usaha  3. Bendahara BOS`,defaultValue:`1. Wakasek Kurikulum  2. Kepala Tata Usaha  3. Bendahara BOS`},{key:`petunjuk_disposisi`,label:`Instruksi / Petunjuk Disposisi`,type:`textarea`,placeholder:`[x] Tindak lanjuti segera
[x] Siapkan laporan dan berkas
[x] Koordinasikan dengan tim terkait`,defaultValue:`[X] Tindak Lanjuti Sesuai Petunjuk Teknis
[X] Siapkan Data dan Berkas Pendukung
[X] Koordinasikan dengan Tim Manajemen Terkait
[X] Laporkan Hasil Pelaksanaan kepada Kepala Sekolah`},{key:`catatan_kepsek`,label:`Catatan Khusus Kepala Sekolah`,type:`textarea`,placeholder:`Harap diselesaikan paling lambat hari Jumat dan berkas diverifikasi lengkap.`,defaultValue:`Harap diselesaikan tepat waktu, siapkan dokumen SPJ dan rekapitulasi data sarpras sebelum jadwal monev tiba.`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-4">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">LEMBAR DISPOSISI KEPALA SEKOLAH</h4>
          <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Agenda Administrasi Persuratan Kedinasan</p>
        </div>

        {/* Tabel Metadata Surat Masuk */}
        <table class="w-full border-collapse border border-black mb-4">
          <tr>
            <td class="border border-black p-2 font-semibold bg-slate-100 w-1/4 print:bg-transparent">Surat Dari</td>
            <td class="border border-black p-2 w-1/4">${t.surat_dari||`-`}</td>
            <td class="border border-black p-2 font-semibold bg-slate-100 w-1/4 print:bg-transparent">No. Agenda</td>
            <td class="border border-black p-2 w-1/4 font-mono font-bold">${t.nomor_agenda||`-`}</td>
          </tr>
          <tr>
            <td class="border border-black p-2 font-semibold bg-slate-100 print:bg-transparent">Nomor Surat Masuk</td>
            <td class="border border-black p-2 font-mono">${t.nomor_surat_masuk||`-`}</td>
            <td class="border border-black p-2 font-semibold bg-slate-100 print:bg-transparent">Tanggal Diterima</td>
            <td class="border border-black p-2">${e(t.tanggal_diterima)}</td>
          </tr>
          <tr>
            <td class="border border-black p-2 font-semibold bg-slate-100 print:bg-transparent">Tanggal Surat</td>
            <td class="border border-black p-2">${e(t.tanggal_surat_masuk)}</td>
            <td class="border border-black p-2 font-semibold bg-slate-100 print:bg-transparent">Sifat Dokumen</td>
            <td class="border border-black p-2 font-bold uppercase text-red-600 print:text-black">${t.sifat||`Penting`}</td>
          </tr>
          <tr>
            <td class="border border-black p-2 font-semibold bg-slate-100 print:bg-transparent">Perihal / Isi Ringkas</td>
            <td colspan="3" class="border border-black p-2 leading-snug"><strong>${t.perihal_isi||`-`}</strong></td>
          </tr>
        </table>

        {/* Tabel Arahan dan Disposisi */}
        <table class="w-full border-collapse border border-black mb-4">
          <thead>
            <tr class="bg-slate-100 print:bg-transparent">
              <th class="border border-black p-2 text-left w-1/2">Diteruskan Kepada Sdr. :</th>
              <th class="border border-black p-2 text-left w-1/2">Petunjuk & Instruksi Kepala Sekolah :</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-black p-3 align-top leading-relaxed">
                <div class="whitespace-pre-line font-medium">${t.diteruskan_kepada||`-`}</div>
              </td>
              <td class="border border-black p-3 align-top leading-relaxed">
                <div class="whitespace-pre-line font-medium">${t.petunjuk_disposisi||`-`}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Catatan Tambahan */}
        <div class="border border-black p-3 bg-slate-50 print:bg-transparent mb-4">
          <p class="font-bold text-[11px] uppercase tracking-wider text-slate-700 print:text-black">Catatan Khusus Kepala Sekolah:</p>
          <p class="mt-1 italic text-justify">${t.catatan_kepsek||`-`}</p>
        </div>
      </div>
    `},{id:`sk-kepala-sekolah`,name:`SK (Surat Keputusan Kepala Sekolah)`,fields:[{key:`nomor`,label:`Nomor Surat Keputusan`,type:`text`,placeholder:`421.3/SK-012/SMKN2-TIKEP/2026`,defaultValue:`421.3/SK-012/SMKN2-TIKEP/2026`},{key:`tanggal_sk`,label:`Tanggal Penetapan SK`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`tentang`,label:`Tentang (Judul Ketetapan SK)`,type:`textarea`,placeholder:`PENETAPAN PEMBAGIAN TUGAS GURU DALAM PROSES BELAJAR MENGAJAR DAN TUGAS TAMBAHAN TAHUN AJARAN 2026/2027`,defaultValue:`PEMBAGIAN TUGAS GURU DALAM PROSES BELAJAR MENGAJAR, BIMBINGAN KONSELING, DAN TUGAS TAMBAHAN LAINNYA DI SMK NEGERI 2 KOTA TIDORE KEPULAUAN TAHUN AJARAN 2026/2027`},{key:`menimbang`,label:`Menimbang (Konsiderans)`,type:`textarea`,placeholder:`a. Bahwa untuk kelancaran proses kegiatan belajar mengajar...
b. Bahwa yang namanya tercantum...`,defaultValue:`a. Bahwa dalam rangka kelancaran proses kegiatan belajar mengajar dan pembinaan kesiswaan pada SMK Negeri 2 Kota Tidore Kepulauan, perlu menetapkan pembagian tugas guru dan staf tata usaha;
b. Bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a, perlu menetapkan Keputusan Kepala SMK Negeri 2 Kota Tidore Kepulauan.`},{key:`mengingat`,label:`Mengingat (Dasar Hukum)`,type:`textarea`,placeholder:`1. Undang-Undang Nomor 20 Tahun 2003...
2. Peraturan Pemerintah Nomor 19 Tahun 2017...`,defaultValue:`1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;
2. Peraturan Pemerintah Nomor 19 Tahun 2017 tentang Perubahan atas PP No. 74 Tahun 2008 tentang Guru;
3. Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi tentang Standar Nasional Pendidikan Vokasi.`},{key:`diktum_kesatu`,label:`Diktum KESATU`,type:`textarea`,placeholder:`Menetapkan pembagian tugas mengajar dan tugas tambahan...`,defaultValue:`Menetapkan pembagian tugas guru dalam proses pembelajaran, pembimbingan, dan tugas tambahan lain sebagaimana tercantum dalam lampiran keputusan ini.`},{key:`diktum_kedua`,label:`Diktum KEDUA`,type:`textarea`,placeholder:`Masing-masing guru bertanggung jawab melaporkan pelaksanaan tugas...`,defaultValue:`Masing-masing guru dan pegawai melaporkan pelaksanaan tugasnya secara tertulis dan berkala kepada Kepala Sekolah.`},{key:`diktum_ketiga`,label:`Diktum KETIGA`,type:`textarea`,placeholder:`Segala biaya yang timbul dibebankan pada anggaran yang sesuai...`,defaultValue:`Segala biaya yang timbul akibat pelaksanaan keputusan ini dibebankan pada Anggaran Pendapatan dan Belanja Sekolah (BOS/BOP) yang relevan.`},{key:`diktum_keempat`,label:`Diktum KEEMPAT`,type:`textarea`,placeholder:`Keputusan ini berlaku sejak tanggal ditetapkan...`,defaultValue:`Keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan apabila terdapat kekeliruan akan diperbaiki sebagaimana mestinya.`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-4">
          <h4 class="text-[13px] uppercase font-bold tracking-wider">KEPUTUSAN KEPALA ${n.schoolName}</h4>
          <p class="text-[11px] font-bold">NOMOR : ${t.nomor||`-`}</p>
          <p class="text-[12px] font-bold uppercase mt-2">TENTANG</p>
          <p class="text-[12px] font-bold uppercase max-w-lg mx-auto leading-snug">${t.tentang||`-`}</p>
          <p class="text-[12px] font-bold uppercase mt-2">DENGAN RAHMAT TUHAN YANG MAHA ESA<br/>KEPALA ${n.schoolName}</p>
        </div>

        <div class="space-y-3 mb-4 text-justify">
          <table class="w-full">
            <tr class="align-top">
              <td class="w-24 font-bold">Menimbang</td>
              <td class="w-4">:</td>
              <td class="whitespace-pre-line leading-relaxed">${t.menimbang||`-`}</td>
            </tr>
            <tr class="align-top">
              <td class="font-bold pt-2">Mengingat</td>
              <td class="pt-2">:</td>
              <td class="pt-2 whitespace-pre-line leading-relaxed">${t.mengingat||`-`}</td>
            </tr>
          </table>

          <div class="text-center my-3 font-bold uppercase tracking-wider">
            MEMUTUSKAN:
          </div>

          <table class="w-full">
            <tr class="align-top">
              <td class="w-24 font-bold">Menetapkan</td>
              <td class="w-4">:</td>
              <td class="font-bold uppercase">${t.tentang||`-`}</td>
            </tr>
            <tr class="align-top">
              <td class="font-bold pt-2">KESATU</td>
              <td class="pt-2">:</td>
              <td class="pt-2 leading-relaxed">${t.diktum_kesatu||`-`}</td>
            </tr>
            <tr class="align-top">
              <td class="font-bold pt-2">KEDUA</td>
              <td class="pt-2">:</td>
              <td class="pt-2 leading-relaxed">${t.diktum_kedua||`-`}</td>
            </tr>
            <tr class="align-top">
              <td class="font-bold pt-2">KETIGA</td>
              <td class="pt-2">:</td>
              <td class="pt-2 leading-relaxed">${t.diktum_ketiga||`-`}</td>
            </tr>
            <tr class="align-top">
              <td class="font-bold pt-2">KEEMPAT</td>
              <td class="pt-2">:</td>
              <td class="pt-2 leading-relaxed">${t.diktum_keempat||`-`}</td>
            </tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <div class="flex justify-end">
            <div class="text-left">
              <p>Ditetapkan di : Tidore</p>
              <p>Pada tanggal : ${e(t.tanggal_sk)}</p>
            </div>
          </div>
        </div>
      </div>
    `},{id:`undangan-ortu`,name:`Undangan Orang Tua / Wali Murid`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`421.3/024/SMKN2-TIKEP/2026`,defaultValue:`421.3/024/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`lampiran`,label:`Lampiran`,type:`text`,placeholder:`-`,defaultValue:`-`},{key:`perihal`,label:`Perihal`,type:`text`,placeholder:`Undangan Rapat Pleno Komite & Wali Murid`,defaultValue:`Undangan Rapat Pleno Komite & Wali Murid`},{key:`penerima`,label:`Penerima Surat`,type:`text`,placeholder:`Bapak/Ibu Orang Tua/Wali Murid Siswa`,defaultValue:`Bapak/Ibu Orang Tua/Wali Murid Kelas X, XI & XII`},{key:`kelas`,label:`Spesifikasi Kelas / Jurusan`,type:`text`,placeholder:`Semua Kompetensi Keahlian SMKN 2 Tidore Kepulauan`,defaultValue:`Semua Kompetensi Keahlian SMKN 2 Tidore Kepulauan`},{key:`hari_tanggal`,label:`Hari & Tanggal Acara`,type:`text`,placeholder:`Senin, 07 September 2026`,defaultValue:`Senin, 07 September 2026`},{key:`waktu`,label:`Waktu Acara`,type:`text`,placeholder:`09.00 - 12.00 WIT`,defaultValue:`09.00 - 12.00 WIT`},{key:`tempat`,label:`Tempat Acara`,type:`text`,placeholder:`Aula Pertemuan Utama SMK Negeri 2 Kota Tidore Kepulauan`,defaultValue:`Aula Pertemuan Utama SMK Negeri 2 Kota Tidore Kepulauan`},{key:`agenda`,label:`Agenda Rapat`,type:`text`,placeholder:`Pembahasan Program Pembelajaran Praktik & PKL Tahun Ajaran Baru`,defaultValue:`Pembahasan Program Pembelajaran Praktik Kejuruan, PKL DUDI, dan Penguatan Sarana Vokasi`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="flex justify-between mb-4">
          <div>
            <table>
              <tr><td class="w-16 py-0.5">Nomor</td><td>: ${t.nomor||`-`}</td></tr>
              <tr><td class="py-0.5">Lampiran</td><td>: ${t.lampiran||`-`}</td></tr>
              <tr><td class="py-0.5">Perihal</td><td>: <strong>${t.perihal||`-`}</strong></td></tr>
            </table>
          </div>
          <div class="text-right">
            Tidore, ${e(t.tanggal_surat)}
          </div>
        </div>

        <div class="mb-4">
          <p>Kepada Yth.<br/>
          <strong>${t.penerima||`-`}</strong><br/>
          ${t.kelas?`<span>${t.kelas}</span><br/>`:``}
          di Tempat</p>
        </div>

        <div class="mb-4 text-justify">
          <p>Dengan hormat,</p>
          <p class="indent-8 mt-1">Sehubungan dengan agenda kerja sekolah serta penyelarasan program pendidikan vokasi tahun ajaran baru, kami bermaksud mengundang Bapak/Ibu Orang Tua/Wali Murid untuk menghadiri Rapat Pertemuan yang akan diselenggarakan pada:</p>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-32 py-0.5">Hari, Tanggal</td><td>: ${t.hari_tanggal||`-`}</td></tr>
            <tr><td class="py-0.5">Waktu</td><td>: ${t.waktu||`-`}</td></tr>
            <tr><td class="py-0.5">Tempat</td><td>: ${t.tempat||`-`}</td></tr>
            <tr><td class="py-0.5">Agenda</td><td>: ${t.agenda||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Mengingat pentingnya agenda rapat ini guna menyukseskan program pendidikan dan kesiapan keahlian anak-anak kita, kehadiran Bapak/Ibu sangat kami harapkan tepat pada waktunya.</p>
          <p class="mt-2">Demikian undangan ini kami sampaikan. Atas perhatian, kehadiran, dan kerja sama yang baik, kami ucapkan terima kasih.</p>
        </div>
      </div>
    `},{id:`surat-tugas`,name:`Surat Tugas Guru / Staf`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`800/112/SMKN2-TIKEP/2026`,defaultValue:`800/112/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_petugas`,label:`Nama Penerima Tugas`,type:`text`,placeholder:`Rustam Ismail, S.Kom.`,defaultValue:`Rustam Ismail, S.Kom.`},{key:`nip_petugas`,label:`NIP/NUPTK Penerima Tugas`,type:`text`,placeholder:`198406122009031002`,defaultValue:`198406122009031002`},{key:`pangkat_golongan`,label:`Pangkat / Golongan`,type:`text`,placeholder:`Penata Muda Tk. I, III/b`,defaultValue:`Penata Muda Tk. I, III/b`},{key:`jabatan`,label:`Jabatan Struktural`,type:`text`,placeholder:`Ketua Program Keahlian TJKT`,defaultValue:`Ketua Program Keahlian TJKT`},{key:`deskripsi_tugas`,label:`Tugas Yang Diberikan`,type:`textarea`,placeholder:`Mengikuti Workshop Peningkatan Kompetensi Guru Kejuruan Berbasis Industri yang diselenggarakan oleh Dinas Pendidikan...`,defaultValue:`Mengikuti Workshop Pelatihan Sinkronisasi Kurikulum Vokasi Berbasis Industri dan Uji Sertifikasi Kompetensi Kejuruan.`},{key:`waktu_tugas`,label:`Waktu Pelaksanaan`,type:`text`,placeholder:`08 s.d 10 September 2026`,defaultValue:`08 s.d 10 September 2026`},{key:`tempat_tugas`,label:`Tempat Pelaksanaan`,type:`text`,placeholder:`Hotel Grand Dafam Bela Ternate / LPMP Maluku Utara`,defaultValue:`Balai Penjaminan Mutu Pendidikan (BPMP) Provinsi Maluku Utara`}],generatePreviewHtml:(e,t)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-5">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT TUGAS</h4>
          <p class="text-[11px] leading-none mt-1">Nomor: ${e.nomor||`-`}</p>
        </div>

        <div class="mb-3 text-justify">
          <p class="indent-8">Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>${t.schoolName}</strong>, dengan ini menugaskan kepada:</p>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-36 py-0.5">Nama Lengkap</td><td>: <strong>${e.nama_petugas||`-`}</strong></td></tr>
            <tr><td class="py-0.5">NIP / NUPTK</td><td>: ${e.nip_petugas||`-`}</td></tr>
            <tr><td class="py-0.5">Pangkat / Golongan</td><td>: ${e.pangkat_golongan||`-`}</td></tr>
            <tr><td class="py-0.5">Jabatan</td><td>: ${e.jabatan||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p>Untuk melaksanakan tugas kedinasan sebagai berikut:</p>
          <div class="border border-black p-3 bg-slate-50 mt-1.5 print:bg-transparent">
            <strong>Deskripsi Penugasan:</strong><br/>
            ${e.deskripsi_tugas||`-`}
          </div>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-36 py-0.5">Waktu Pelaksanaan</td><td>: ${e.waktu_tugas||`-`}</td></tr>
            <tr><td class="py-0.5">Tempat Pelaksanaan</td><td>: ${e.tempat_tugas||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Demikian Surat Tugas ini dibuat untuk dilaksanakan dengan sebaik-baiknya dan penuh rasa tanggung jawab, serta menyampaikan laporan hasil pelaksanaan tugas setelah kegiatan selesai.</p>
        </div>
      </div>
    `},{id:`skl`,name:`Surat Keterangan Lulus (SKL)`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`422.1/312/SMKN2-TIKEP/2026`,defaultValue:`422.1/312/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_siswa`,label:`Nama Lengkap Siswa`,type:`text`,placeholder:`Achmad Fauzan`,defaultValue:`Achmad Fauzan`},{key:`tempat_lahir`,label:`Tempat Lahir`,type:`text`,placeholder:`Tidore`,defaultValue:`Tidore`},{key:`tanggal_lahir`,label:`Tanggal Lahir`,type:`date`,defaultValue:`2008-06-15`},{key:`nis_nisn`,label:`NIS / NISN`,type:`text`,placeholder:`20812 / 0081234567`,defaultValue:`20812 / 0081234567`},{key:`nomor_peserta`,label:`Nomor Ujian Peserta`,type:`text`,placeholder:`U-SMKN2-098`,defaultValue:`U-SMKN2-098`},{key:`program_keahlian`,label:`Program / Kompetensi Keahlian`,type:`text`,placeholder:`Teknik Komputer dan Jaringan (TKJ)`,defaultValue:`Teknik Komputer dan Jaringan (TKJ)`},{key:`status_kelulusan`,label:`Status Kelulusan`,type:`select`,options:[`LULUS`,`TIDAK LULUS`],defaultValue:`LULUS`},{key:`nilai_rata_rata`,label:`Nilai Rata-rata Ujian Sekolah & UKK`,type:`text`,placeholder:`88.75`,defaultValue:`88.75`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-4">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT KETERANGAN LULUS</h4>
          <p class="text-[11px] leading-none mt-1">Nomor: ${t.nomor||`-`}</p>
        </div>

        <div class="mb-3 text-justify">
          <p class="indent-8">Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>${n.schoolName}</strong> menerangkan bahwa:</p>
        </div>

        <div class="mb-3 ml-6">
          <table class="w-full">
            <tr><td class="w-40 py-0.5">Nama Siswa</td><td>: <strong>${t.nama_siswa||`-`}</strong></td></tr>
            <tr><td class="py-0.5">Tempat, Tanggal Lahir</td><td>: ${t.tempat_lahir||`-`}, ${e(t.tanggal_lahir)}</td></tr>
            <tr><td class="py-0.5">NIS / NISN</td><td>: ${t.nis_nisn||`-`}</td></tr>
            <tr><td class="py-0.5">Nomor Ujian Peserta</td><td>: ${t.nomor_peserta||`-`}</td></tr>
            <tr><td class="py-0.5">Kompetensi Keahlian</td><td>: ${t.program_keahlian||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8 text-justify">Berdasarkan kriteria kelulusan satuan pendidikan yang mengacu pada Peraturan Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi serta hasil Rapat Dewan Pendidik, siswa yang bersangkutan dinyatakan:</p>
          
          <div class="text-center my-4">
            <span class="inline-block border-2 border-black px-6 py-2 text-[15px] font-extrabold uppercase bg-slate-100 tracking-widest print:bg-transparent">
              ${t.status_kelulusan||`LULUS`}
            </span>
          </div>

          <p class="indent-8">dengan Nilai Rata-rata Ujian Sekolah & UKK: <strong>${t.nilai_rata_rata||`0.00`}</strong>.</p>
          <p class="mt-2 indent-8">Surat keterangan kelulusan ini bersifat sementara dan berlaku sah sampai dengan diterbitkannya Ijazah asli. Demikian untuk dipergunakan sebagaimana mestinya.</p>
        </div>
      </div>
    `},{id:`surat-pengantar`,name:`Surat Pengantar Umum`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`045.2/089/SMKN2-TIKEP/2026`,defaultValue:`045.2/089/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`penerima`,label:`Penerima Pengantar`,type:`text`,placeholder:`Kepala Kantor Cabang Dinas Pendidikan Provinsi Maluku Utara di Tidore`,defaultValue:`Kepala Kantor Cabang Dinas Pendidikan Kota Tidore Kepulauan`},{key:`nama_berkas`,label:`Jenis Berkas yang Dikirim`,type:`textarea`,placeholder:`Laporan Realisasi Program Bantuan Revitalisasi SMK dan Data Sarpras Praktik Kejuruan.`,defaultValue:`Laporan Realisasi Program Revitalisasi Vokasi dan Usulan Bantuan Alat Praktik SMKN 2 Tidore Kepulauan.`},{key:`jumlah_berkas`,label:`Jumlah / Banyaknya`,type:`text`,placeholder:`1 (satu) Berkas Lengkap`,defaultValue:`1 (satu) Berkas Lengkap`},{key:`keterangan_berkas`,label:`Keterangan`,type:`text`,placeholder:`Disampaikan dengan hormat untuk periksa dan tindak lanjut.`,defaultValue:`Disampaikan dengan hormat untuk menjadi periksa dan pertimbangan lebih lanjut.`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="flex justify-between mb-4">
          <div>
            <table>
              <tr><td class="w-16 py-0.5">Nomor</td><td>: ${t.nomor||`-`}</td></tr>
              <tr><td class="py-0.5">Lampiran</td><td>: 1 Berkas</td></tr>
              <tr><td class="py-0.5">Perihal</td><td>: Surat Pengantar</td></tr>
            </table>
          </div>
          <div class="text-right">
            Tidore, ${e(t.tanggal_surat)}
          </div>
        </div>

        <div class="mb-4">
          <p>Kepada Yth.<br/>
          <strong>${t.penerima||`-`}</strong><br/>
          di Tempat</p>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8">Bersama ini kami kirimkan berkas administrasi instansi sebagaimana tercantum pada tabel di bawah ini:</p>
        </div>

        <div class="mb-4">
          <table class="w-full border-collapse border border-black">
            <thead>
              <tr class="bg-slate-100 print:bg-transparent">
                <th class="border border-black px-3 py-1.5 text-center w-12">No</th>
                <th class="border border-black px-3 py-1.5 text-left">Jenis Berkas yang Dikirim</th>
                <th class="border border-black px-3 py-1.5 text-center w-36">Banyaknya</th>
                <th class="border border-black px-3 py-1.5 text-left w-48">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-black px-3 py-4 text-center">1</td>
                <td class="border border-black px-3 py-4 text-left font-semibold">${t.nama_berkas||`-`}</td>
                <td class="border border-black px-3 py-4 text-center">${t.jumlah_berkas||`-`}</td>
                <td class="border border-black px-3 py-4 text-left text-[11px]">${t.keterangan_berkas||`-`}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Demikian surat pengantar ini kami sampaikan, atas perhatian dan penerimaan yang baik dari Bapak/Ibu kami ucapkan terima kasih.</p>
        </div>
      </div>
    `},{id:`rekomendasi`,name:`Surat Rekomendasi`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`421.4/098/SMKN2-TIKEP/2026`,defaultValue:`421.4/098/SMKN2-TIKEP/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_rekomendasi`,label:`Nama Yang Direkomendasikan`,type:`text`,placeholder:`Fitriani Taher`,defaultValue:`Fitriani Taher`},{key:`id_rekomendasi`,label:`NISN / NIP / NIK`,type:`text`,placeholder:`NISN: 0087654321`,defaultValue:`NISN: 0087654321`},{key:`instansi_jabatan`,label:`Kelas / Posisi`,type:`text`,placeholder:`Kelas XII Teknik Komputer Jaringan`,defaultValue:`Kelas XII Teknik Komputer Jaringan`},{key:`tujuan_rekomendasi`,label:`Keperluan / Tujuan Rekomendasi`,type:`text`,placeholder:`Mengikuti Seleksi Beasiswa Pendidikan Vokasi Unggulan & Lomba Kompetensi Siswa (LKS)`,defaultValue:`Mengikuti Seleksi Beasiswa Prestasi Pendidikan Vokasi Unggulan Nasional`},{key:`isi_rekomendasi`,label:`Alasan Rekomendasi`,type:`textarea`,placeholder:`Siswa yang bersangkutan memiliki catatan prestasi akademik dan kejuruan yang luar biasa...`,defaultValue:`Siswa yang bersangkutan merupakan peserta didik berprestasi di sekolah kami, berkarakter jujur, santun, serta memiliki keahlian teknis yang sangat kompeten. Kami memberikan rekomendasi dan dukungan penuh atas keikutsertaannya.`}],generatePreviewHtml:(e,t)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-5">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT REKOMENDASI</h4>
          <p class="text-[11px] leading-none mt-1">Nomor: ${e.nomor||`-`}</p>
        </div>

        <div class="mb-3 text-justify">
          <p class="indent-8">Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>${t.schoolName}</strong> dengan ini memberikan rekomendasi kepada:</p>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-36 py-0.5">Nama Lengkap</td><td>: <strong>${e.nama_rekomendasi||`-`}</strong></td></tr>
            <tr><td class="py-0.5">NISN / NIP</td><td>: ${e.id_rekomendasi||`-`}</td></tr>
            <tr><td class="py-0.5">Kelas / Jurusan</td><td>: ${e.instansi_jabatan||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8">Rekomendasi ini diberikan untuk keperluan: <strong>${e.tujuan_rekomendasi||`-`}</strong>.</p>
          <p class="indent-8 mt-2"><strong>Pertimbangan Rekomendasi:</strong></p>
          <div class="border border-black p-3 bg-slate-50 mt-1 print:bg-transparent text-justify">
            ${e.isi_rekomendasi||`-`}
          </div>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Demikian surat rekomendasi ini dibuat dengan sebenarnya agar dapat dipergunakan secara bertanggung jawab oleh pihak yang berkepentingan.</p>
        </div>
      </div>
    `},{id:`penerimaan-pindahan`,name:`Surat Keterangan Kesediaan Menerima`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`400.3.8 / 68  / 08 / SMKN. 2 / TIKEP/ 2026`,defaultValue:`400.3.8 / 68  / 08 / SMKN. 2 / TIKEP/ 2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_siswa`,label:`Nama Lengkap Siswa`,type:`text`,placeholder:`Nabila Safitri`,defaultValue:`Nabila Safitri`},{key:`nisn`,label:`NISN`,type:`text`,placeholder:`0091234567`,defaultValue:`0091234567`},{key:`asal_sekolah`,label:`Asal Sekolah`,type:`text`,placeholder:`SMK Negeri 1 Kota Ternate`,defaultValue:`SMK Negeri 1 Kota Ternate`},{key:`kelas_diterima`,label:`Diterima di Kelas / Jurusan`,type:`text`,placeholder:`XI Teknik Komputer dan Jaringan`,defaultValue:`XI Teknik Komputer dan Jaringan`},{key:`tanggal_permohonan`,label:`Tanggal Surat Permohonan Ortu`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`dasar_penerimaan`,label:`Dasar Pertimbangan Penerimaan`,type:`textarea`,placeholder:`Telah diverifikasi kelengkapan berkas kepindahan dan daya tampung rombel kejuruan masih mencukupi.`,defaultValue:`Telah memenuhi persyaratan administrasi kepindahan sekolah dan kuota daya tampung rombongan belajar kelas yang bersangkutan masih tersedia.`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-5">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT  KETERANGAN KESEDIAAN MENERIMA</h4>
          <p class="text-[11px] leading-none mt-1">Nomor : ${t.nomor||`-`}</p>
        </div>

        <div class="mb-3 text-justify">
          <p class="indent-8">Berdasarkan surat permohonan kepindahan dari orang tua/wali siswa tertanggal ${e(t.tanggal_permohonan)}, Kepala Sekolah <strong>${n.schoolName}</strong> menyatakan bersedia menerima siswa di bawah ini:</p>
        </div>

        <div class="mb-4 ml-6">
          <table class="w-full">
            <tr><td class="w-36 py-0.5">Nama Siswa</td><td>: <strong>${t.nama_siswa||`-`}</strong></td></tr>
            <tr><td class="py-0.5">NISN</td><td>: ${t.nisn||`-`}</td></tr>
            <tr><td class="py-0.5">Asal Sekolah</td><td>: ${t.asal_sekolah||`-`}</td></tr>
            <tr><td class="py-0.5">Diterima di Kelas</td><td>: <strong>${t.kelas_diterima||`-`}</strong></td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8"><strong>Dasar Pertimbangan:</strong></p>
          <div class="border border-black p-3 bg-slate-50 mt-1 print:bg-transparent text-justify">
            ${t.dasar_penerimaan||`-`}
          </div>
          <p class="mt-2 indent-8">Siswa wajib menyerahkan berkas mutasi resmi (Surat Keterangan Pindah & Rapor Asli yang telah disahkan) dan bersedia menaati seluruh tata tertib di sekolah kami.</p>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Demikian surat keterangan penerimaan pindah masuk sekolah ini dibuat agar menjadi periksa dan dapat dipergunakan seperlunya.</p>
        </div>
      </div>
    `}];export{t as n,e as t};