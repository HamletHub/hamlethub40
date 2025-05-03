import GoogleAds from './GoogleAds';

export default function ExampleAdUsage() {
  return (
    <div className="mt-8 space-y-8">
      <div className="my-4">
        <h2 className="text-xl font-bold mb-2">Content Section</h2>
        <p className="mb-4">
          This is an example of content with ads placed in strategic positions.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
          dignissim ipsum eget felis gravida, ac malesuada diam tempus.
        </p>
        
        {/* Medium Rectangle Ad (300x250) */}
        <div className="my-4 flex justify-center">
          <GoogleAds 
            alias="sidebar_ad" 
            size="300x250" 
            className="bg-gray-100 min-h-[250px] min-w-[300px]" 
          />
        </div>
        
        <p className="mb-4">
          Continue with more content here. Nulla facilisi. Phasellus auctor velit
          nec ante tincidunt, non sodales magna fermentum. Donec viverra libero sed
          efficitur facilisis. In hac habitasse platea dictumst.
        </p>
      </div>
      
      {/* Leaderboard Ad (970x90) */}
      <div className="w-full flex justify-center my-8">
        <GoogleAds 
          alias="leaderboard_ad" 
          size="970x90" 
          className="bg-gray-100 min-h-[90px] min-w-[970px] max-w-full" 
        />
      </div>
      
      <div className="my-4">
        <h2 className="text-xl font-bold mb-2">More Content</h2>
        <p>
          This shows how ads can be placed at different sections of your page.
          Implement ads where they make sense for your layout, but be careful
          not to overwhelm users with too many advertisements.
        </p>
      </div>
    </div>
  );
} 