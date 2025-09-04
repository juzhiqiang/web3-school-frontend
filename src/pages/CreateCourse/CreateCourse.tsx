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
    </>
  );
}

export default CreateCourse;