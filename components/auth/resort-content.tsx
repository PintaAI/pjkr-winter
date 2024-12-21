export const ResortContent = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Jadi.. Event Winter kali ini akan diadakan di :
          </h2>
          
          <div className="bg-teal-500 text-white px-6 py-2 rounded-full text-xl inline-block">
            Kesulitan area : Pemula - Mahir
          </div>
          
          <h3 className="text-5xl md:text-6xl font-bold">
            JISAN FOREST RESORT SKI
          </h3>
          
          <div className="max-w-2xl mx-auto text-lg md:text-xl space-y-6">
            <p>
              Jisan Forest Resort Ski adalah salah satu resort ski terbaik di Korea Selatan.
            </p>
            <p>
              Resort ini menjadi destinasi populer bagi wisatawan lokal maupun internasional yang ingin menikmati keindahan musim dingin sambil mencoba berbagai olahraga salju, seperti ski dan snowboard.
            </p>
            <p>
              Resort ini juga dikelilingi oleh hutan pinus yang indah, menciptakan suasana tenang dan pastinya alami serta menyegarkan.
            </p>
          </div>
          
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block">
            <p className="flex items-center justify-center gap-2 text-lg">
              <span>📍</span>
              267, Jisan-ro, Majang-myeon, Icheon-si, Gyeonggi-do
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
