var e=e=>{if(!e)return``;let t=new Date(e);return isNaN(t.getTime())?e:`${t.getDate()} ${[`Januari`,`Februari`,`Maret`,`April`,`Mei`,`Juni`,`Juli`,`Agustus`,`September`,`Oktober`,`November`,`Desember`][t.getMonth()]} ${t.getFullYear()}`},t=[{id:`undangan-ortu`,name:`Undangan Orang Tua / Wali Murid`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`421.3/024/SMAN1-MRD/VIII/2026`,defaultValue:`421.3/024/SMAN1-MRD/VIII/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`lampiran`,label:`Lampiran`,type:`text`,placeholder:`-`,defaultValue:`-`},{key:`perihal`,label:`Perihal`,type:`text`,placeholder:`Undangan Rapat Pleno Wali Murid`,defaultValue:`Undangan Rapat Pleno Wali Murid`},{key:`penerima`,label:`Penerima Surat`,type:`text`,placeholder:`Bapak/Ibu Orang Tua/Wali Murid`,defaultValue:`Bapak/Ibu Orang Tua/Wali Murid`},{key:`kelas`,label:`Spesifikasi Kelas (Opsional)`,type:`text`,placeholder:`Kelas X dan XI (Semua Jurusan)`,defaultValue:`Kelas X dan XI (Semua Jurusan)`},{key:`hari_tanggal`,label:`Hari & Tanggal Acara`,type:`text`,placeholder:`Senin, 17 Agustus 2026`,defaultValue:`Senin, 17 Agustus 2026`},{key:`waktu`,label:`Waktu Acara`,type:`text`,placeholder:`09.00 - 12.00 WIB`,defaultValue:`09.00 - 12.00 WIB`},{key:`tempat`,label:`Tempat Acara`,type:`text`,placeholder:`Aula Pertemuan Utama Sekolah`,defaultValue:`Aula Pertemuan Utama Sekolah`},{key:`agenda`,label:`Agenda Rapat`,type:`text`,placeholder:`Pembahasan Rencana Program Kerja Semester Ganjil`,defaultValue:`Pembahasan Rencana Program Kerja Semester Ganjil`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="flex justify-between mb-4">
          <div>
            <table>
              <tr><td class="w-16">Nomor</td><td>: ${t.nomor||`-`}</td></tr>
              <tr><td>Lampiran</td><td>: ${t.lampiran||`-`}</td></tr>
              <tr><td>Perihal</td><td>: <strong>${t.perihal||`-`}</strong></td></tr>
            </table>
          </div>
          <div class="text-right">
            ${n.address.split(`,`)[1]||`Jakarta`}, ${e(t.tanggal_surat)}
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
          <p class="indent-8 mt-1">Sehubungan dengan dimulainya tahun ajaran baru serta penyusunan program pembelajaran dan anggaran sekolah, kami bermaksud mengundang Bapak/Ibu Orang Tua/Wali Murid untuk menghadiri Rapat Pertemuan Wali Murid yang akan diselenggarakan pada:</p>
        </div>

        <div class="mb-4 ml-8">
          <table class="w-full">
            <tr><td class="w-32">Hari, Tanggal</td><td>: ${t.hari_tanggal||`-`}</td></tr>
            <tr><td>Waktu</td><td>: ${t.waktu||`-`}</td></tr>
            <tr><td>Tempat</td><td>: ${t.tempat||`-`}</td></tr>
            <tr><td>Agenda</td><td>: ${t.agenda||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Mengingat pentingnya agenda rapat ini guna menyelaraskan program pendidikan anak-anak kita, kehadiran Bapak/Ibu sangat kami harapkan. Jika berhalangan hadir, mohon dapat mewakilkan dengan membawa surat kuasa.</p>
          <p class="mt-2">Demikian undangan ini kami sampaikan. Atas perhatian, kehadiran, dan kerja sama yang baik, kami ucapkan terima kasih.</p>
        </div>
      </div>
    `},{id:`surat-tugas`,name:`Surat Tugas Guru / Staf`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`800/112/SMAN1-MRD/VIII/2026`,defaultValue:`800/112/SMAN1-MRD/VIII/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_petugas`,label:`Nama Penerima Tugas`,type:`text`,placeholder:`Budi Santoso, S.Pd.`,defaultValue:`Budi Santoso, S.Pd.`},{key:`nip_petugas`,label:`NIP/NUPTK Penerima Tugas`,type:`text`,placeholder:`19820415 200904 1 003`,defaultValue:`19820415 200904 1 003`},{key:`pangkat_golongan`,label:`Pangkat / Golongan`,type:`text`,placeholder:`Penata Muda, III/a`,defaultValue:`Penata Muda, III/a`},{key:`jabatan`,label:`Jabatan Struktural`,type:`text`,placeholder:`Guru Madya / Wali Kelas XI`,defaultValue:`Guru Madya / Wali Kelas XI`},{key:`deskripsi_tugas`,label:`Tugas Yang Diberikan`,type:`textarea`,placeholder:`Mengikuti Bimbingan Teknis Implementasi Kurikulum Merdeka yang diselenggarakan oleh Dinas Pendidikan...`,defaultValue:`Mengikuti Bimbingan Teknis Implementasi Kurikulum Merdeka yang diselenggarakan oleh Dinas Pendidikan Daerah.`},{key:`waktu_tugas`,label:`Waktu Pelaksanaan`,type:`text`,placeholder:`18 s.d 20 Agustus 2026`,defaultValue:`18 s.d 20 Agustus 2026`},{key:`tempat_tugas`,label:`Tempat Pelaksanaan`,type:`text`,placeholder:`LPMP Provinsi DKI Jakarta`,defaultValue:`LPMP Provinsi DKI Jakarta`}],generatePreviewHtml:(e,t)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-6">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT TUGAS</h4>
          <p class="text-[11px] leading-none">Nomor: ${e.nomor||`-`}</p>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8">Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>${t.schoolName}</strong>, dengan ini memberikan tugas kepada:</p>
        </div>

        <div class="mb-4 ml-8">
          <table class="w-full">
            <tr><td class="w-36">Nama Lengkap</td><td>: <strong>${e.nama_petugas||`-`}</strong></td></tr>
            <tr><td>NIP / NUPTK</td><td>: ${e.nip_petugas||`-`}</td></tr>
            <tr><td>Pangkat / Golongan</td><td>: ${e.pangkat_golongan||`-`}</td></tr>
            <tr><td>Jabatan</td><td>: ${e.jabatan||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p>Untuk melaksanakan tugas sebagai berikut:</p>
          <div class="border border-black p-3 bg-slate-50 mt-1 print:bg-transparent">
            <strong>Deskripsi Tugas:</strong><br/>
            ${e.deskripsi_tugas||`-`}
          </div>
        </div>

        <div class="mb-4 ml-8">
          <table class="w-full">
            <tr><td class="w-36">Waktu Pelaksanaan</td><td>: ${e.waktu_tugas||`-`}</td></tr>
            <tr><td>Tempat Pelaksanaan</td><td>: ${e.tempat_tugas||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Demikian Surat Tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab, dan setelah menyelesaikan tugas tersebut agar membuat laporan tertulis kepada Kepala Sekolah.</p>
        </div>
      </div>
    `},{id:`skl`,name:`Surat Keterangan Lulus (SKL)`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`422.1/312/SMAN1-MRD/VIII/2026`,defaultValue:`422.1/312/SMAN1-MRD/VIII/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_siswa`,label:`Nama Lengkap Siswa`,type:`text`,placeholder:`Rian Hidayat`,defaultValue:`Rian Hidayat`},{key:`tempat_lahir`,label:`Tempat Lahir`,type:`text`,placeholder:`Jakarta`,defaultValue:`Jakarta`},{key:`tanggal_lahir`,label:`Tanggal Lahir`,type:`date`,defaultValue:`2008-05-12`},{key:`nis_nisn`,label:`NIS / NISN`,type:`text`,placeholder:`20812 / 0081234567`,defaultValue:`20812 / 0081234567`},{key:`nomor_peserta`,label:`Nomor Ujian Peserta`,type:`text`,placeholder:`U-SMAN1-098`,defaultValue:`U-SMAN1-098`},{key:`program_keahlian`,label:`Program / Jurusan`,type:`text`,placeholder:`MIPA (Matematika & Ilmu Pengetahuan Alam)`,defaultValue:`MIPA (Matematika & Ilmu Pengetahuan Alam)`},{key:`status_kelulusan`,label:`Status Kelulusan`,type:`select`,options:[`LULUS`,`TIDAK LULUS`],defaultValue:`LULUS`},{key:`nilai_rata_rata`,label:`Nilai Rata-rata Ujian Sekolah`,type:`text`,placeholder:`87.56`,defaultValue:`87.56`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-4">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT KETERANGAN LULUS</h4>
          <p class="text-[11px] leading-none">Nomor: ${t.nomor||`-`}</p>
        </div>

        <div class="mb-3 text-justify">
          <p class="indent-8">Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>${n.schoolName}</strong> menerangkan bahwa:</p>
        </div>

        <div class="mb-3 ml-8">
          <table class="w-full">
            <tr><td class="w-40">Nama Siswa</td><td>: <strong>${t.nama_siswa||`-`}</strong></td></tr>
            <tr><td>Tempat, Tanggal Lahir</td><td>: ${t.tempat_lahir||`-`}, ${e(t.tanggal_lahir)}</td></tr>
            <tr><td>NIS / NISN</td><td>: ${t.nis_nisn||`-`}</td></tr>
            <tr><td>Nomor Ujian Peserta</td><td>: ${t.nomor_peserta||`-`}</td></tr>
            <tr><td>Program Studi / Jurusan</td><td>: ${t.program_keahlian||`-`}</td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8 text-justify">Berdasarkan hasil Kriteria Kelulusan Satuan Pendidikan yang mengacu pada Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi, serta melalui Rapat Dewan Guru mengenai Penetapan Kelulusan Tahun Ajaran, siswa yang bersangkutan dinyatakan:</p>
          
          <div class="text-center my-4">
            <span class="inline-block border-2 border-black px-6 py-2 text-[16px] font-extrabold uppercase bg-slate-100 tracking-widest print:bg-transparent">
              ${t.status_kelulusan||`LULUS`}
            </span>
          </div>

          <p class="indent-8">dengan Nilai Rata-rata Ujian Sekolah: <strong>${t.nilai_rata_rata||`0.00`}</strong>.</p>
          <p class="mt-2 indent-8">Surat keterangan ini berlaku sementara sampai dengan diterbitkannya Ijazah asli siswa yang bersangkutan oleh Kementerian Pendidikan terkait. Harap dokumen ini digunakan sebagaimana mestinya.</p>
        </div>
      </div>
    `},{id:`surat-pengantar`,name:`Surat Pengantar Umum`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`045.2/089/SMAN1-MRD/VIII/2026`,defaultValue:`045.2/089/SMAN1-MRD/VIII/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`penerima`,label:`Penerima Pengantar`,type:`text`,placeholder:`Kepala Kantor Cabang Dinas Pendidikan Wilayah I`,defaultValue:`Kepala Kantor Cabang Dinas Pendidikan Wilayah I`},{key:`nama_berkas`,label:`Jenis Berkas yang Dikirim`,type:`textarea`,placeholder:`Proposal Permohonan Bantuan Renovasi Laboratorium Komputer SMAN 1 Merdeka Tahun Anggaran 2027.`,defaultValue:`Proposal Permohonan Bantuan Renovasi Laboratorium Komputer SMAN 1 Merdeka.`},{key:`jumlah_berkas`,label:`Jumlah / Banyaknya`,type:`text`,placeholder:`1 (satu) Berkas Lengkap`,defaultValue:`1 (satu) Berkas Lengkap`},{key:`keterangan_berkas`,label:`Keterangan`,type:`text`,placeholder:`Dikirim dengan hormat untuk menjadi periksa dan pertimbangan.`,defaultValue:`Dikirim dengan hormat untuk menjadi periksa dan pertimbangan.`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="flex justify-between mb-4">
          <div>
            <table>
              <tr><td class="w-16">Nomor</td><td>: ${t.nomor||`-`}</td></tr>
              <tr><td>Lampiran</td><td>: 1 Berkas</td></tr>
              <tr><td>Perihal</td><td>: Surat Pengantar</td></tr>
            </table>
          </div>
          <div class="text-right">
            ${n.address.split(`,`)[1]||`Jakarta`}, ${e(t.tanggal_surat)}
          </div>
        </div>

        <div class="mb-4">
          <p>Kepada Yth.<br/>
          <strong>${t.penerima||`-`}</strong><br/>
          di Tempat</p>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8">Bersama ini kami kirimkan dokumen/berkas kelengkapan administrasi instansi dengan rincian tabel di bawah ini:</p>
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
          <p class="indent-8">Demikian surat pengantar ini dibuat, atas perhatian dan kerja sama yang baik dari Bapak/Ibu kami mengucapkan terima kasih banyak.</p>
        </div>
      </div>
    `},{id:`rekomendasi`,name:`Surat Rekomendasi`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`421.4/098/SMAN1-MRD/VIII/2026`,defaultValue:`421.4/098/SMAN1-MRD/VIII/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_rekomendasi`,label:`Nama Yang Direkomendasikan`,type:`text`,placeholder:`Ahmad Faisal`,defaultValue:`Ahmad Faisal`},{key:`id_rekomendasi`,label:`NISN / NIP / NIK`,type:`text`,placeholder:`NISN: 0098765432`,defaultValue:`NISN: 0098765432`},{key:`instansi_jabatan`,label:`Kelas / Posisi`,type:`text`,placeholder:`Kelas XII MIPA 2`,defaultValue:`Kelas XII MIPA 2`},{key:`tujuan_rekomendasi`,label:`Keperluan / Tujuan`,type:`text`,placeholder:`Mengikuti program Pertukaran Pelajar Nasional Berprestasi.`,defaultValue:`Mengikuti program Pertukaran Pelajar Nasional Berprestasi.`},{key:`isi_rekomendasi`,label:`Alasan Rekomendasi`,type:`textarea`,placeholder:`Siswa yang bersangkutan memiliki catatan prestasi akademik yang luar biasa, berkarakter baik, jujur, serta aktif berorganisasi dalam OSIS...`,defaultValue:`Siswa yang bersangkutan merupakan siswa berprestasi di sekolah kami, selalu menjaga etika moral, dan aktif berorganisasi. Kami memberikan dukungan penuh atas keikutsertaannya dalam kegiatan tersebut.`}],generatePreviewHtml:(e,t)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-6">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT REKOMENDASI</h4>
          <p class="text-[11px] leading-none">Nomor: ${e.nomor||`-`}</p>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8">Yang bertanda tangan di bawah ini, Kepala Sekolah <strong>${t.schoolName}</strong> dengan ini memberikan rekomendasi kepada:</p>
        </div>

        <div class="mb-4 ml-8">
          <table class="w-full">
            <tr><td class="w-36">Nama Lengkap</td><td>: <strong>${e.nama_rekomendasi||`-`}</strong></td></tr>
            <tr><td>NISN / NIP / NIK</td><td>: ${e.id_rekomendasi||`-`}</td></tr>
            <tr><td>Kelas / Posisi</td><td>: ${e.instansi_jabatan||`-`}</td></tr>
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
          <p class="indent-8">Demikian surat rekomendasi ini dibuat dengan sebenar-benarnya untuk dipergunakan secara bijak sebagaimana mestinya oleh pihak-pihak yang berkepentingan.</p>
        </div>
      </div>
    `},{id:`penerimaan-pindahan`,name:`Surat Penerimaan Siswa Pindahan`,fields:[{key:`nomor`,label:`Nomor Surat`,type:`text`,placeholder:`422.2/076/SMAN1-MRD/VIII/2026`,defaultValue:`422.2/076/SMAN1-MRD/VIII/2026`},{key:`tanggal_surat`,label:`Tanggal Surat`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`nama_siswa`,label:`Nama Lengkap Siswa`,type:`text`,placeholder:`Annisa Putri`,defaultValue:`Annisa Putri`},{key:`nisn`,label:`NISN`,type:`text`,placeholder:`0091234567`,defaultValue:`0091234567`},{key:`asal_sekolah`,label:`Asal Sekolah`,type:`text`,placeholder:`SMA Negeri 5 Kota Bandung`,defaultValue:`SMA Negeri 5 Kota Bandung`},{key:`kelas_diterima`,label:`Diterima di Kelas`,type:`text`,placeholder:`XI-F (Fase F)`,defaultValue:`XI-F (Fase F)`},{key:`tanggal_permohonan`,label:`Tanggal Surat Permohonan Ortu`,type:`date`,defaultValue:new Date().toISOString().split(`T`)[0]},{key:`dasar_penerimaan`,label:`Dasar Pertimbangan Penerimaan`,type:`textarea`,placeholder:`Telah dilakukan verifikasi kelengkapan berkas kepindahan sekolah, hasil psikotes internal, dan kuota daya tampung kelas yang memadai.`,defaultValue:`Telah memenuhi persyaratan administrasi kepindahan sekolah dan kuota daya tampung rombongan belajar kelas yang bersangkutan masih tersedia.`}],generatePreviewHtml:(t,n)=>`
      <div class="font-serif text-black text-[12px] leading-relaxed">
        <div class="text-center mb-6">
          <h4 class="text-[14px] uppercase font-bold tracking-wider underline">SURAT PENERIMAAN SISWA PINDAHAN</h4>
          <p class="text-[11px] leading-none">Nomor: ${t.nomor||`-`}</p>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8">Berdasarkan surat permohonan kepindahan sekolah dari orang tua/wali murid tertanggal ${e(t.tanggal_permohonan)}, Kepala Sekolah <strong>${n.schoolName}</strong> menyatakan bersedia menerima siswa di bawah ini:</p>
        </div>

        <div class="mb-4 ml-8">
          <table class="w-full">
            <tr><td class="w-36">Nama Siswa</td><td>: <strong>${t.nama_siswa||`-`}</strong></td></tr>
            <tr><td>NISN</td><td>: ${t.nisn||`-`}</td></tr>
            <tr><td>Asal Sekolah</td><td>: ${t.asal_sekolah||`-`}</td></tr>
            <tr><td>Diterima di Kelas</td><td>: <strong>${t.kelas_diterima||`-`}</strong></td></tr>
          </table>
        </div>

        <div class="mb-4 text-justify">
          <p class="indent-8"><strong>Dasar Pertimbangan Penerimaan:</strong></p>
          <div class="border border-black p-3 bg-slate-50 mt-1 print:bg-transparent text-justify">
            ${t.dasar_penerimaan||`-`}
          </div>
          <p class="mt-2 indent-8">Dengan ketentuan bahwa pihak siswa bersedia mematuhi tata tertib sekolah kami dan melengkapi surat pelepasan resmi dari sekolah asal beserta buku mutasi rapor yang sudah disahkan dinas pendidikan setempat.</p>
        </div>

        <div class="mb-8 text-justify">
          <p class="indent-8">Demikian surat keterangan penerimaan pindah masuk sekolah ini dibuat agar menjadi periksa dan dapat dipergunakan seperlunya.</p>
        </div>
      </div>
    `}];export{t as n,e as t};