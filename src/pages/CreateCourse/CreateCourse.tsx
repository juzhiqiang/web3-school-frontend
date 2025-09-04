import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

// 假设这些组件存在，如果不存在请创建或导入正确的路径
const SuccessModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <div className="text-center">
        <div className="text-green-500 text-4xl mb-4">✓</div>
        <h3 className="text-lg font-semibold mb-2">创建成功！</h3>
        <p className="text-gray-600">课程已成功创建。</p>
      </div>
    </div>
  </div>
);

const CreateCourse = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  return (
    <React.Fragment>
      <div>
        {/* Contract Error Display */}
        {contractError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">合约错误:</span>
              <span>{contractError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}
    </React.Fragment>
  );
};

export default CreateCourse;